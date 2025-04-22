import datetime
import uuid
from decimal import Decimal
from enum import Enum

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    purchases: list["Purchase"] = Relationship(
        back_populates="owner", cascade_delete=True
    )
    sales: list["Sale"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


class PurchaseStatus(str, Enum):
    IN_PROGRESS = "En cours"
    RECEIVED = "Réceptionné"
    COMPLETED = "Terminé"


# Shared properties for Purchase
class PurchaseBase(SQLModel):
    date: datetime.date
    price: Decimal
    name: str | None = Field(default=None, max_length=255)


# Properties to receive on purchase creation
class PurchaseCreate(PurchaseBase):
    product_ids: list[uuid.UUID]


# Properties to receive on purchase update
class PurchaseUpdate(PurchaseBase):
    date: datetime.date | None = Field(default=None)
    price: Decimal | None = Field(default=None)
    name: str | None = Field(default=None, max_length=255)
    status: PurchaseStatus | None = Field(default=None)
    product_ids: list[uuid.UUID] | None = Field(default=None)


# Database model for purchases
class Purchase(PurchaseBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="purchases")
    products: list["Product"] = Relationship(
        back_populates="purchase",
        cascade_delete=True,
    )
    status: PurchaseStatus = Field(default=PurchaseStatus.IN_PROGRESS)


# Properties to return via API
class PurchasePublic(PurchaseBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    products: list["ProductPublic"]
    status: PurchaseStatus


# Collection of purchases to return via API
class PurchasesPublic(SQLModel):
    data: list[PurchasePublic]
    count: int


class SaleStatus(str, Enum):
    TO_PREPARE = "A préparer"
    SHIPPED = "Expédiée"
    COMPLETED = "Terminée"


# Shared properties for Sale
class SaleBase(SQLModel):
    date: datetime.date
    total_price: Decimal


# Properties to receive on sale creation
class SaleCreate(SaleBase):
    product_ids: list[uuid.UUID]


# Properties to receive on sale update
class SaleUpdate(SaleBase):
    date: datetime.date | None = Field(default=None)
    total_price: Decimal | None = Field(default=None)
    product_ids: list[uuid.UUID] | None = Field(default=None)
    status: SaleStatus | None = Field(default=None)


# Database model for sales
class Sale(SaleBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="sales")
    products: list["Product"] = Relationship(
        back_populates="sale",
        sa_relationship_kwargs={"primaryjoin": "Sale.id==Product.sale_id"},
    )
    status: SaleStatus = Field(default=SaleStatus.TO_PREPARE)


# Properties to return via API
class SalePublic(SaleBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    products: list["ProductPublic"]
    status: SaleStatus


# Collection of sales to return via API
class SalesPublic(SQLModel):
    data: list[SalePublic]
    count: int


class ProductStatus(str, Enum):
    TO_PUBLISH = "A publier"
    PUBLISHED = "Publié"
    SOLD = "Vendu"


# Shared properties for Product
class ProductBase(SQLModel):
    name: str = Field(max_length=255)
    estimated_selling_price: Decimal


# Properties to receive on product creation
class ProductCreate(ProductBase):
    pass


# Properties to receive on product update
class ProductUpdate(ProductBase):
    name: str | None = Field(default=None, max_length=255)
    estimated_selling_price: Decimal | None = Field(default=None)
    status: ProductStatus | None = Field(default=None)


# Database model for products
class Product(ProductBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    purchase_id: uuid.UUID | None = Field(
        default=None, foreign_key="purchase.id", nullable=True, ondelete="SET NULL"
    )
    purchase: Purchase = Relationship(back_populates="products")
    sale_id: uuid.UUID | None = Field(
        default=None, foreign_key="sale.id", nullable=True, ondelete="SET NULL"
    )
    sale: Sale | None = Relationship(back_populates="products")
    status: ProductStatus = Field(default=ProductStatus.TO_PUBLISH)


# Properties to return via API
class ProductPublic(ProductBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    purchase_id: uuid.UUID | None
    sale_id: uuid.UUID | None
    status: ProductStatus


# Collection of products to return via API
class ProductsPublic(SQLModel):
    data: list[ProductPublic]
    count: int
