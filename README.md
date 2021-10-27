# fill

Fill databases with dummy data using yaml files

### Getting started

```bash
npm i -g @gabrielrufino/fill
fill config.yml
```

### Config file

```yaml
version: 0

config:
  connection:
    type: postgres
    host: localhost
    port: 5432
    user: root
    pass: root
    database: testing
  tables:
    - name: users
      quantity: 300
      columns:
        - name: name
          generator: 'name.findName'
        - name: company
          value: Dell
```
