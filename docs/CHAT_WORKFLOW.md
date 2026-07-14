# Chat workflow

1. Customer opens a session in `ai` state.
2. AI answers only from approved catalogue and care information.
3. Customer requests the breeder and supplies a name and phone number.
4. Status becomes `pending` and appears in the admin panel.
5. Admin accepts it, changing status to `accepted`.
6. The first admin reply changes status to `active`.
7. Either side can read new messages by session ID; the website polls while waiting.
8. Admin closes the conversation, changing status to `closed`.

Customers never see other customer conversations or private administrator details.
