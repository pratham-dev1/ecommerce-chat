# Chat ER Diagram

```mermaid
erDiagram
  USERS {
    bigint id PK
    string name
    string username
    integer age
    date dob
    string email
    string password
    datetime created_at
    datetime updated_at
    datetime deleted_at
  }

  CONVERSATIONS {
    bigint id PK
    enum type "direct | group"
    string title
    string direct_key UK
    bigint created_by FK
    datetime created_at
    datetime updated_at
    datetime deleted_at
  }

  CONVERSATION_MEMBERS {
    bigint conversation_id PK, FK
    bigint user_id PK, FK
    enum role "owner | admin | member"
    datetime joined_at
    datetime left_at
    bigint last_read_message_id FK
    datetime created_at
    datetime updated_at
  }

  MESSAGES {
    bigint id PK
    bigint conversation_id FK
    bigint sender_id FK
    text body
    enum message_type "text"
    datetime edited_at
    datetime created_at
    datetime updated_at
    datetime deleted_at
  }

  USERS ||--o{ CONVERSATIONS : creates
  USERS ||--o{ CONVERSATION_MEMBERS : joins
  CONVERSATIONS ||--o{ CONVERSATION_MEMBERS : has
  CONVERSATIONS ||--o{ MESSAGES : contains
  USERS ||--o{ MESSAGES : sends
  MESSAGES ||--o{ CONVERSATION_MEMBERS : last_read_by
```

## Notes

- `conversation_members` uses a composite primary key: `conversation_id + user_id`.
- `conversations.direct_key` is unique and is used to keep direct conversations idempotent.
- `messages.sender_id` is always the authenticated user who sent the message.
- `conversation_members.last_read_message_id` points to the last message read by that member.
