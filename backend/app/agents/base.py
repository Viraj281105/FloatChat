# app/agents/base.py (Enhanced Version)
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Union, List
import logging
import time
from datetime import datetime


class BaseAgent(ABC):
    """
    Abstract base class for all specialist agents in the multi-agent system.
    
    This enhanced base class provides:
    - Common interface that the OrchestratorAgent uses to interact with specialist agents
    - Built-in logging and performance monitoring capabilities
    - Error handling and validation frameworks
    - State management utilities for multi-step workflows
    - Extensible metadata system for agent introspection
    
    All specialist agents (DataAgent, GeographicAgent, VisualizationAgent) inherit
    from this class to ensure consistent behavior and interface compatibility.
    """

    def __init__(self, agent_name: Optional[str] = None):
        """
        Initialize the base agent with logging and performance tracking.
        
        Args:
            agent_name: Optional custom name for the agent (defaults to class name)
        """
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
        """
        Executes the given task with comprehensive error handling and logging.

        This is the main entry point for all specialist agents. Implementations
        should handle:
        - Natural language processing of the task
        - State validation and management
        - Core business logic execution
        - Result formatting and validation
        - Error handling and recovery

        Args:
            task (str): The specific instruction or query for the agent.
                       Should be in natural language and clearly specify the desired outcome.
            state (Dict[str, Any]): The current execution state, containing:
                                   - session_id: Unique identifier for the conversation
                                   - history: Previous interactions and results
                                   - return_df: Boolean flag for DataFrame vs. formatted response
                                   - data_frame: Pre-computed data from other agents
                                   - Any other agent-specific state variables

        Returns:
            Any: The result of the agent's execution. Common return types:
                - str: Formatted response text for user consumption
                - pd.DataFrame: Structured data for further processing
                - dict: Complex structured responses
                - JSON string: Serialized visualizations or complex objects

        Raises:
            NotImplementedError: If the method is not implemented by the subclass
            ValueError: If the task or state parameters are invalid
            RuntimeError: If execution fails due to system or data issues
        """
        pass

    def _validate_task(self, task: str) -> None:
        """
        Validate the input task parameter.
        
        Args:
            task: The task string to validate
            
        Raises:
            ValueError: If task is invalid or empty
        """
        if not isinstance(task, str):
            raise ValueError(f"Task must be a string, got {type(task).__name__}")
        
        if not task.strip():
            raise ValueError("Task cannot be empty or whitespace only")
        
        if len(task) > 10000:  # Reasonable limit
            raise ValueError("Task is too long (max 10,000 characters)")

    def _validate_state(self, state: Dict[str, Any]) -> None:
        """
        Validate the input state parameter.
        
        Args:
            state: The state dictionary to validate
            
        Raises:
            ValueError: If state is invalid
        """
        if not isinstance(state, dict):
            raise ValueError(f"State must be a dictionary, got {type(state).__name__}")
        
        # Ensure state has a session_id
        if "session_id" not in state:
            state["session_id"] = "default_session"
            self.logger.warning("No session_id provided, using default")

    def _record_execution_metrics(self, execution_time: float, success: bool) -> None:
        """
        Record performance metrics for this execution.
        
        Args:
            execution_time: Time taken for execution in seconds
            success: Whether the execution was successful
        """
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
        """
        Execute the task with comprehensive error handling and metrics collection.
        
        This method wraps the abstract execute() method with:
        - Input validation
        - Performance monitoring
        - Error handling and logging
        - Standardized response formatting
        
        Args:
            task: The task to execute
            state: The execution state
            
        Returns:
            Dictionary containing:
            - success: Boolean indicating if execution was successful
            - result: The actual result or None if failed
            - error: Error message if execution failed
            - execution_time: Time taken for execution
            - agent_name: Name of the agent that executed the task
        """
        start_time = time.time()
        
        try:
            # Validate inputs
            self._validate_task(task)
            self._validate_state(state)
            
            # Log execution start
            self.logger.info(f"Starting execution of task: {task[:100]}...")
            
            # Execute the actual task
            result = self.execute(task, state)
            
            # Record successful execution
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
            # Record failed execution
            execution_time = time.time() - start_time
            self._record_execution_metrics(execution_time, success=False)
            
            # Log the error
            self.logger.error(f"Execution failed: {str(e)}", exc_info=True)
            
            return {
                "success": False,
                "result": None,
                "error": str(e),
                "execution_time": execution_time,
                "agent_name": self.agent_name
            }

    def get_capabilities(self) -> List[str]:
        """
        Return a list of capabilities supported by this agent.
        
        Returns:
            List of capability strings
        """
        return list(self._capabilities)

    def get_supported_tasks(self) -> List[str]:
        """
        Return a list of task types supported by this agent.
        
        Returns:
            List of supported task type strings
        """
        return self._supported_tasks.copy()

    def get_performance_stats(self) -> Dict[str, Union[int, float]]:
        """
        Return performance statistics for this agent.
        
        Returns:
            Dictionary containing performance metrics
        """
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
        """
        Return comprehensive information about this agent.
        
        Returns:
            Dictionary containing agent metadata and performance information
        """
        return {
            "agent_name": self.agent_name,
            "agent_class": self.__class__.__name__,
            "capabilities": self.get_capabilities(),
            "supported_tasks": self.get_supported_tasks(),
            "performance_stats": self.get_performance_stats(),
            "initialization_time": self._initialization_time.isoformat()
        }

    def _add_capability(self, capability: str) -> None:
        """
        Add a capability to this agent (for use by subclasses).
        
        Args:
            capability: Capability string to add
        """
        self._capabilities.add(capability)
        self.logger.debug(f"Added capability: {capability}")

    def _add_supported_task(self, task_type: str) -> None:
        """
        Add a supported task type to this agent (for use by subclasses).
        
        Args:
            task_type: Task type string to add
        """
        if task_type not in self._supported_tasks:
            self._supported_tasks.append(task_type)
            self.logger.debug(f"Added supported task type: {task_type}")

    def _log_task_start(self, task: str, additional_info: Optional[Dict[str, Any]] = None) -> None:
        """
        Log the start of task execution with optional additional information.
        
        Args:
            task: The task being executed
            additional_info: Optional dictionary of additional information to log
        """
        log_msg = f"Executing task: {task[:100]}..."
        if additional_info:
            info_str = ", ".join(f"{k}={v}" for k, v in additional_info.items())
            log_msg += f" [{info_str}]"
        
        self.logger.info(log_msg)

    def _log_task_complete(self, task: str, result_summary: Optional[str] = None) -> None:
        """
        Log the completion of task execution.
        
        Args:
            task: The task that was executed
            result_summary: Optional summary of the result
        """
        log_msg = f"Completed task: {task[:100]}..."
        if result_summary:
            log_msg += f" Result: {result_summary}"
        
        self.logger.info(log_msg)

    def __repr__(self) -> str:
        """
        Return a string representation of this agent.
        
        Returns:
            String representation including agent name and execution count
        """
        return f"{self.__class__.__name__}(name='{self.agent_name}', executions={self._execution_count})"