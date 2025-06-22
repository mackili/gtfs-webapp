FROM python:3.12-alpine
ARG DO_UPSERT=true
ARG BATCH_SIZE=1000
ARG BATCH_SIZE_RT=1
ENV DO_UPSERT=$DO_UPSERT
ENV BATCH_SIZE=$BATCH_SIZE
ENV BATCH_SIZE_RT=$BATCH_SIZE_RT
WORKDIR /code
COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY /code /code
CMD ["fastapi", "run", "main.py", "--port", "8000"]