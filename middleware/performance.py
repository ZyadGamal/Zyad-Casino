import time
from flask import request, g
from functools import wraps

def track_performance():
    g.start_time = time.time()

@app.after_request
def after_request(response):
    if hasattr(g, 'start_time'):
        duration = time.time() - g.start_time
        response.headers['X-Response-Time'] = f"{duration:.5f} sec"
        if duration > 0.5:  # تحذير إذا تجاوزت المدة نصف ثانية
            current_app.logger.warning(
                f"Slow request: {request.path} took {duration:.3f} seconds"
            )
    return response

def performance_logger(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = fn(*args, **kwargs)
        duration = time.time() - start_time
        current_app.logger.info(
            f"Performance: {fn.__name__} took {duration:.5f} seconds"
        )
        return result
    return wrapper