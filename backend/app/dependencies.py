from app.settings import Settings

GLOBALSETTINGS = None

#Return or init the global instance
def get_settings():
    """
    This dependency function is to allow settings to be overridden in testing via a FastAPI's dependency overrides
    method.
    """
    global GLOBALSETTINGS
    if GLOBALSETTINGS is None:
        GLOBALSETTINGS = Settings()
    return GLOBALSETTINGS
