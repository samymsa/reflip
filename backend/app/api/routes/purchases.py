import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Message,
    Product,
    Purchase,
    PurchaseCreate,
    PurchasePublic,
    PurchasesPublic,
    PurchaseUpdate,
)

router = APIRouter(prefix="/purchases", tags=["purchases"])


@router.get("/", response_model=PurchasesPublic)
def read_purchases(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve purchases.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Purchase)
        count = session.exec(count_statement).one()
        statement = select(Purchase).offset(skip).limit(limit)
        purchases = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Purchase)
            .where(Purchase.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Purchase)
            .where(Purchase.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        purchases = session.exec(statement).all()

    # Include products for each purchase
    result_purchases = []
    for purchase in purchases:
        products = session.exec(
            select(Product).where(Product.purchase_id == purchase.id)
        ).all()
        purchase_dict = purchase.model_dump()
        purchase_dict["products"] = products
        result_purchases.append(PurchasePublic(**purchase_dict))

    return PurchasesPublic(data=result_purchases, count=count)


@router.get("/{id}", response_model=PurchasePublic)
def read_purchase(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get purchase by ID.
    """
    purchase = session.get(Purchase, id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    if not current_user.is_superuser and (purchase.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # Get associated products
    products = session.exec(
        select(Product).where(Product.purchase_id == purchase.id)
    ).all()

    purchase_dict = purchase.model_dump()
    purchase_dict["products"] = products

    return PurchasePublic(**purchase_dict)


@router.post("/", response_model=PurchasePublic)
def create_purchase(
    *, session: SessionDep, current_user: CurrentUser, purchase_in: PurchaseCreate
) -> Any:
    """
    Create new purchase.
    """
    purchase = Purchase.model_validate(
        purchase_in, update={"owner_id": current_user.id}
    )
    session.add(purchase)
    session.commit()
    session.refresh(purchase)

    # Initialize with empty products list
    purchase_dict = purchase.model_dump()
    purchase_dict["products"] = []

    return PurchasePublic(**purchase_dict)


@router.put("/{id}", response_model=PurchasePublic)
def update_purchase(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    purchase_in: PurchaseUpdate,
) -> Any:
    """
    Update a purchase.
    """
    purchase = session.get(Purchase, id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    if not current_user.is_superuser and (purchase.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    update_dict = purchase_in.model_dump(exclude_unset=True)
    purchase.sqlmodel_update(update_dict)
    session.add(purchase)
    session.commit()
    session.refresh(purchase)

    # Get associated products
    products = session.exec(
        select(Product).where(Product.purchase_id == purchase.id)
    ).all()

    purchase_dict = purchase.model_dump()
    purchase_dict["products"] = products

    return PurchasePublic(**purchase_dict)


@router.delete("/{id}")
def delete_purchase(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a purchase.
    """
    purchase = session.get(Purchase, id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    if not current_user.is_superuser and (purchase.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # The products will be deleted automatically due to cascade_delete=True
    session.delete(purchase)
    session.commit()
    return Message(message="Purchase deleted successfully")
