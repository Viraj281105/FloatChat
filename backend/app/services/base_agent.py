from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Union, List
import logging
import time
from datetime import datetime


class BaseAgent(ABC):
    """
    Abstract base class for all specialist agents in the multi-agent system.
    """

    def __init__(self, agent_name: Optional[str] = None):
        self.agent_name = agent_name or self.__class__.__name__
        self.logger = logging.getLogger(f"agents.{self.agent_name.lower()}")
        
        # Performance and execution tracking
        self._execution_count = 0
        self._total_execution_time = 0.0
        self._last_execution_time = 0.0
        
        # Agent metadata for introspection
        self._capabilities = set()
        self._supported_tasks = []
        self._initialization_time = datetime.now()
        
        self.logger.info(f"{self.agent_name} initialized successfully")

    @abstractmethod
    def execute(self, task: str, state: Dict[str, Any]) -> Any:
        pass

    def _validate_task(self, task: str) -> None:
        if not isinstance(task, str):
            raise ValueError(f"Task must be a string, got {type(task).__name__}")
        
        if not task.strip():
            raise ValueError("Task cannot be empty or whitespace only")
        
        if len(task) > 10000:
            raise ValueError("Task is too long (max 10,000 characters)")

    def _validate_state(self, state: Dict[str, Any]) -> None:
        if not isinstance(state, dict):
            raise ValueError(f"State must be a dictionary, got {type(state).__name__}")
        
        if "session_id" not in state:
            state["session_id"] = "default_session"
            self.logger.warning("No session_id provided, using default")

    def _record_execution_metrics(self, execution_time: float, success: bool) -> None:
        self._execution_count += 1
        self._last_execution_time = execution_time
        
        if success:
            self._total_execution_time += execution_time
            self.logger.debug(
                f"Execution #{self._execution_count} completed in {execution_time:.3f}s"
            )
        else:
            self.logger.warning(
                f"Execution #{self._execution_count} failed after {execution_time:.3f}s"
            )

    def safe_execute(self, task: str, state: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        
        try:
            self._validate_task(task)
            self._validate_state(state)
            self.logger.info(f"Starting execution of task: {task[:100]}...")
            
            result = self.execute(task, state)
            execution_time = time.time() - start_time
            self._record_execution_metrics(execution_time, success=True)
            
            return {
                "success": True,
                "result": result,
                "error": None,
                "execution_time": execution_time,
                "agent_name": self.agent_name
            }
            
        except Exception as e:
            execution_time = time.time() - start_time
            self._record_execution_metrics(execution_time, success=False)
            self.logger.error(f"Execution failed: {str(e)}", exc_info=True)
            
            return {
                "success": False,
                "result": None,
                "error": str(e),
                "execution_time": execution_time,
                "agent_name": self.agent_name
            }

    def get_capabilities(self) -> List[str]:
        return list(self._capabilities)

    def get_supported_tasks(self) -> List[str]:
        return self._supported_tasks.copy()

    def get_performance_stats(self) -> Dict[str, Union[int, float]]:
        avg_execution_time = (
            self._total_execution_time / self._execution_count 
            if self._execution_count > 0 else 0.0
        )
        
        return {
            "total_executions": self._execution_count,
            "total_execution_time": self._total_execution_time,
            "average_execution_time": avg_execution_time,
            "last_execution_time": self._last_execution_time,
            "uptime_seconds": (datetime.now() - self._initialization_time).total_seconds()
        }

    def get_agent_info(self) -> Dict[str, Any]:
        return {
            "agent_name": self.agent_name,
            "agent_class": self.__class__.__name__,
            "capabilities": self.get_capabilities(),
            "supported_tasks": self.get_supported_tasks(),
            "performance_stats": self.get_performance_stats(),
            "initialization_time": self._initialization_time.isoformat()
        }

    def _add_capability(self, capability: str) -> None:
        self._capabilities.add(capability)

    def _add_supported_task(self, task_type: str) -> None:
        if task_type not in self._supported_tasks:
            self._supported_tasks.append(task_type)

    def _log_task_start(self, task: str, additional_info: Optional[Dict[str, Any]] = None) -> None:
        log_msg = f"Executing task: {task[:100]}..."
        if additional_info:
            info_str = ", ".join(f"{k}={v}" for k, v in additional_info.items())
            log_msg += f" [{info_str}]"
        self.logger.info(log_msg)

    def _log_task_complete(self, task: str, result_summary: Optional[str] = None) -> None:
        log_msg = f"Completed task: {task[:100]}..."
        if result_summary:
            log_msg += f" Result: {result_summary}"
        self.logger.info(log_msg)

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name='{self.agent_name}', executions={self._execution_count})"
