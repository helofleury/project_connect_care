import pandas as pd

vehicle_file = "data/ford_vehicle_360.xlsx"
service_file = "data/ford_service_history_tratado.xlsx"

print("Lendo ford_vehicle_360.xlsx...")
vehicles = pd.read_excel(vehicle_file)

print("Lendo ford_service_history_tratado.xlsx...")
services = pd.read_excel(service_file)

print("\n===== VEÍCULOS =====")
print(f"Linhas: {len(vehicles)}")
print(f"Colunas: {len(vehicles.columns)}")
print("Primeiras colunas:")
print(vehicles.columns.tolist()[:10])

print("\n===== HISTÓRICO DE SERVIÇOS =====")
print(f"Linhas: {len(services)}")
print(f"Colunas: {len(services.columns)}")
print("Primeiras colunas:")
print(services.columns.tolist()[:10])

print("\nLeitura concluída com sucesso!")