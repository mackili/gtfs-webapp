FROM python:3.12-alpine
WORKDIR /code
COPY requirements.txt requirements.txt
COPY requirements.txt requirements.txt
EXPOSE 5000
COPY . .
RUN pip install --requirement /tmp/requirements.txt