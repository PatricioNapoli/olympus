FROM python:alpine3.8

WORKDIR /usr/olympus

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

ENTRYPOINT ["./entrypoint.sh"]
