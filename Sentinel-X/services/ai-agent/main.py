import os
import logging
import sys
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger("ai-agent")
logger.info("Sentinel-X AI Agent starting...")

app = FastAPI()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
logger.info(f"Configuring Gemini with API Key: {api_key[:5]}...{api_key[-5:]}")

class DiagnosticRequest(BaseModel):
    service_name: str
    error_log: str
    latency_ms: float

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-agent"}

@app.post("/analyze")
async def analyze_bottleneck(request: DiagnosticRequest):
    logger.info(f"Request received: {request.dict()}")
    
    prompt = f"""
    Você é um Engenheiro de Confiabilidade de Site (SRE) especializado em IA do sistema Sentinel-X.
    Analise o seguinte gargalo operacional e sugira uma solução técnica rápida.
    
    Serviço: {request.service_name}
    Log de Erro: {request.error_log}
    Latência Detectada: {request.latency_ms}ms
    
    Retorne a resposta no formato JSON com os campos:
    - "diagnosis": Uma explicação curta do que está acontecendo.
    - "suggested_fix": Uma ação técnica para resolver.
    - "ai_confidence": Porcentagem de confiança.
    """
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        
        # Extract text from response
        ai_text = data['candidates'][0]['content']['parts'][0]['text']
        
        logger.info("AI analysis completed successfully via v1 API")
        return {
            "analysis": ai_text,
            "raw_data": request
        }
    except requests.exceptions.HTTPError as e:
        logger.error(f"AI Analysis failed with HTTP Error: {str(e)}")
        if e.response is not None:
             logger.error(f"Response body: {e.response.text}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"AI Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
