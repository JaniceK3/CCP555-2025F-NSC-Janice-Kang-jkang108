# Convert markdown fragment to HTML

# Create markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`Markdown **bold** text`

HTTP/1.1 201

[Captures]
url: header "Location"

# Request HTML version
GET {{url}}.html
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" matches "^text/html"
body contains "<p>Markdown <strong>bold</strong> text</p>"
