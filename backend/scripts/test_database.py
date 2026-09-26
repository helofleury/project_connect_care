import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_connection


try:
    connection = get_connection()

    print("Conexão com PostgreSQL realizada com sucesso!")

    connection.close()

except Exception as error:
    print("Erro ao conectar com PostgreSQL:")
    print(error)