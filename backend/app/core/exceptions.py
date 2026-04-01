"""Domain exception types."""


class NotFoundError(Exception):
    def __init__(self, message: str = "Resource not found"):
        self.message = message
        super().__init__(message)


class ValidationError(Exception):
    def __init__(self, message: str = "Validation error"):
        self.message = message
        super().__init__(message)


class ConflictError(Exception):
    def __init__(self, message: str = "Conflict"):
        self.message = message
        super().__init__(message)


class InvalidLifecycleTransitionError(Exception):
    def __init__(self, message: str = "Invalid lifecycle transition"):
        self.message = message
        super().__init__(message)


class UnsupportedSourceError(Exception):
    def __init__(self, message: str = "Unsupported source"):
        self.message = message
        super().__init__(message)
