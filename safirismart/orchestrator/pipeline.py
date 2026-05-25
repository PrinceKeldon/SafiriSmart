"""
SafiriSmart — LangGraph Orchestrator

Wires Intent Agent → Wildlife Signal Agent → Itinerary Builder
into a stateful sequential pipeline.

The graph is compiled once at startup and reused for every request.
Each node is a synchronous function that receives and returns the full state.
"""

import logging
import uuid
import time
from typing import Optional

from langgraph.graph import StateGraph, END

from safirismart.orchestrator.state import OrchestratorState
from safirismart.agents.intent_agent import run_intent_agent
from safirismart.agents.wildlife_signal_agent import run_wildlife_signal_agent
from safirismart.agents.itinerary_builder import run_itinerary_builder

logger = logging.getLogger(__name__)


def _should_continue_to_wildlife(state: OrchestratorState) -> str:
    """Only proceed if intent extraction succeeded."""
    if state.get("traveler_profile"):
        return "wildlife_signal"
    return END


def _should_continue_to_itinerary(state: OrchestratorState) -> str:
    """Only build itinerary if we have both profile and wildlife context."""
    if state.get("traveler_profile") and state.get("wildlife_context"):
        return "itinerary_builder"
    return END


def build_graph() -> StateGraph:
    """Build and compile the SafiriSmart agent graph."""
    graph = StateGraph(OrchestratorState)

    # Register nodes
    graph.add_node("intent",           run_intent_agent)
    graph.add_node("wildlife_signal",  run_wildlife_signal_agent)
    graph.add_node("itinerary_builder",run_itinerary_builder)

    # Entry point
    graph.set_entry_point("intent")

    # Conditional edges with graceful degradation
    graph.add_conditional_edges("intent",           _should_continue_to_wildlife,   {"wildlife_signal": "wildlife_signal", END: END})
    graph.add_conditional_edges("wildlife_signal",  _should_continue_to_itinerary,  {"itinerary_builder": "itinerary_builder", END: END})
    graph.add_edge("itinerary_builder", END)

    return graph.compile()


# ── Compiled graph (singleton) ────────────────────────────────────
_graph = None

def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


# ── Main entry point ──────────────────────────────────────────────

def run_pipeline(raw_input: str, session_id: Optional[str] = None) -> dict:
    """
    Run the full SafiriSmart agent pipeline.

    Args:
        raw_input:  Natural language traveler query
        session_id: Optional session ID for conversation continuity

    Returns:
        Complete state dict with traveler_profile, wildlife_context, itinerary
    """
    t_total = time.time()

    initial_state: OrchestratorState = {
        "raw_input":        raw_input,
        "session_id":       session_id or str(uuid.uuid4()),
        "traveler_profile": None,
        "wildlife_context": None,
        "itinerary":        None,
        "errors":           [],
        "completed_agents": [],
        "processing_ms":    {},
    }

    graph  = get_graph()
    result = graph.invoke(initial_state)

    total_ms = int((time.time() - t_total) * 1000)
    result["processing_ms"]["total"] = total_ms

    logger.info(
        f"Pipeline complete in {total_ms}ms | "
        f"agents={result.get('completed_agents')} | "
        f"errors={result.get('errors')}"
    )

    return result
