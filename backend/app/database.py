import os
from importlib import import_module
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = (
    f"postgresql://postgres:{os.getenv('POSTGRES_PASSWORD')}"
    "@localhost:5433/connectcare360"
)


def get_connection():
    try:
        psycopg = import_module("psycopg")
    except ImportError as exc:
        raise RuntimeError(
            "The psycopg package is required. Install it with: "
            "pip install psycopg[binary]"
        ) from exc

    return psycopg.connect(DATABASE_URL)