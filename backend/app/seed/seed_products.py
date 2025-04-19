from faker import Faker
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlmodel import SQLModel

from app.core.config import settings  # noqa
from app.models import Product


def get_url():
    return str(settings.SQLALCHEMY_DATABASE_URI)


def seed_products(count=100):
    engine = create_engine(get_url())
    SQLModel.metadata.create_all(engine)  # Ensure the table exists

    fake = Faker("fr_FR")  # Use French locale for Faker
    products = [
        Product(
            name=fake.unique.word().capitalize(),
            estimated_selling_price=round(
                fake.random_number(digits=4, fix_len=True) / 100, 2
            ),
        )
        for _ in range(count)
    ]

    with Session(engine) as session:
        session.add_all(products)
        session.commit()
        print("Random products seeded successfully.")


if __name__ == "__main__":
    seed_products()
