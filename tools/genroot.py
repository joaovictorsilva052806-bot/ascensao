# O app do JV (/ascensao/) é o MESMO dos testadores: gen.py --root troca só as chaves de dados, a planilha e acrescenta a aba Criador.
# Módulos novos (ex.: tools/forja.*) entram só no gen.py e chegam aqui por ele.
import os,subprocess,sys
subprocess.run([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'gen.py'),'--root'],check=True)
