import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Message,
    Product,
    Sale,
    SaleCreate,
    SalePublic,
    SalesPublic,
    SaleUpdate,
)

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("/", response_model=SalesPublic)
def read_sales(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve sales.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Sale)
        count = session.exec(count_statement).one()
        statement = select(Sale).offset(skip).limit(limit)
        sales = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Sale)
            .where(Sale.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Sale)
            .where(Sale.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        sales = session.exec(statement).all()

    # Include products for each sale
    result_sales = []
    for sale in sales:
        products = session.exec(select(Product).where(Product.sale_id == sale.id)).all()
        sale_dict = sale.model_dump()
        sale_dict["products"] = products
        result_sales.append(SalePublic(**sale_dict))

    return SalesPublic(data=result_sales, count=count)


@router.get("/{id}", response_model=SalePublic)
def read_sale(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get sale by ID.
    """
    sale = session.get(Sale, id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if not current_user.is_superuser and (sale.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # Get associated products
    products = session.exec(select(Product).where(Product.sale_id == sale.id)).all()

    sale_dict = sale.model_dump()
    sale_dict["products"] = products

    return SalePublic(**sale_dict)


@router.post("/", response_model=SalePublic)
def create_sale(
    *, session: SessionDep, current_user: CurrentUser, sale_in: SaleCreate
) -> Any:
    """
    Create new sale.
    """
    sale = Sale.model_validate(sale_in, update={"owner_id": current_user.id})
    session.add(sale)
    session.commit()
    session.refresh(sale)

    # Initialize with empty products list
    sale_dict = sale.model_dump()
    sale_dict["products"] = []

    return SalePublic(**sale_dict)


@router.put("/{id}", response_model=SalePublic)
def update_sale(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    sale_in: SaleUpdate,
) -> Any:
    """
    Update a sale.
    """
    sale = session.get(Sale, id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if not current_user.is_superuser and (sale.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    update_dict = sale_in.model_dump(exclude_unset=True)
    sale.sqlmodel_update(update_dict)
    session.add(sale)
    session.commit()
    session.refresh(sale)

    # Get associated products
    products = session.exec(select(Product).where(Product.sale_id == sale.id)).all()

    sale_dict = sale.model_dump()
    sale_dict["products"] = products

    return SalePublic(**sale_dict)


@router.delete("/{id}")
def delete_sale(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a sale.
    """
    sale = session.get(Sale, id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if not current_user.is_superuser and (sale.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # The products will be deleted automatically due to cascade_delete=True
    session.delete(sale)
    session.commit()
    return Message(message="Sale deleted successfully")
