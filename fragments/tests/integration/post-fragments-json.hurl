# Posting a JSON fragment and reading it back
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
`{"message":"hello","value":123}`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"

[Captures]
url: header "Location"

# GET the JSON fragment back
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json

[Asserts]
# Now we're asserting on the fragment body itself as JSON
jsonpath "$.message" == "hello"
jsonpath "$.value" == 123
