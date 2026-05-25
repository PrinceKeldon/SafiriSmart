import os
from langchain_core.language_models import BaseChatModel


def _required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is not configured")
    return value


def get_llm(temperature: float = 0, max_tokens: int = 4000) -> BaseChatModel:
    provider = os.getenv("LLM_PROVIDER", "anthropic").lower()

    if provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            api_key=_required_env("GROQ_API_KEY"),
            temperature=temperature,
        )
    elif provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
            google_api_key=_required_env("GOOGLE_API_KEY"),
            temperature=temperature,
        )
    elif provider == "ollama":
        from langchain_ollama import ChatOllama
        return ChatOllama(
            model=os.getenv("OLLAMA_MODEL", "llama3.2"),
            temperature=temperature,
        )
    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            api_key=_required_env("OPENAI_API_KEY"),
            temperature=temperature,
        )
    else:  # default: anthropic
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514"),
            api_key=_required_env("ANTHROPIC_API_KEY"),
            max_tokens=max_tokens,
            temperature=temperature,
        )
