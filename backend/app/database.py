from importlib import import_module

DATABASE_URL="postgresql://postgres:[SUA_SENHA]@localhost:5433/connectcare360"


def get_connection():
    try:
        psycopg = import_module("psycopg")
    except ImportError as exc:
        raise RuntimeError(
            "The psycopg package is required. Install it with: "
            "pip install psycopg[binary]"
        ) from exc

    return psycopg.connect(DATABASE_URL)