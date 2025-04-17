# Light-Post Style Guide & Architectural Principles

This document outlines key style and architectural decisions for the Light-Post backend to ensure consistency, clarity, and maintainability, especially during early development.

## Guiding Principles

*   **Simplicity First:** Prioritize clear, straightforward code over complex abstractions, especially initially.
*   **Stability:** Focus on reliable core functionality before premature optimization.
*   **Developer Control:** Maintain visibility into core operations like database interactions and authentication flow.
*   **Iterative Improvement:** Build a solid foundation that can be refactored or extended later if needed.

## Database Interaction (`sqlite3`)

**Current Approach (Preferred): Direct SQL with Promises**

At this stage of development, we will interact with the SQLite database directly using the `sqlite3` library and raw SQL queries, wrapped manually in Promises.

**Rationale:**

*   **Transparency:** Allows developers (especially those comfortable with SQL) to see and control the exact database queries being executed.
*   **Simplicity:** Avoids introducing the overhead and learning curve of an Object-Relational Mapper (ORM) or complex Repository patterns prematurely.
*   **Control:** Provides fine-grained control over query performance and structure.

**Implementation Pattern:**

1.  Use the initialized `db` object (`sqlite3.Database`).
2.  For asynchronous database operations (`db.get`, `db.run`, `db.all`), wrap the call within `new Promise((resolve, reject) => { ... })`.
3.  Write the raw SQL query string within the `db` method call.
4.  **Crucially:** Use parameterized queries (e.g., `SELECT * FROM users WHERE id = ?`) and pass parameters as an array (e.g., `[userId]`) to prevent SQL injection vulnerabilities. **Do not** use string interpolation to build queries with user input.
5.  Inside the `sqlite3` callback function `(err, result)`:
    *   Check for `err` first. If an error exists, log it and call `reject(err)`.
    *   If no error, call `resolve(result)`. The `result` will be the `row` for `db.get`, `this` (containing `lastID`, `changes`) for `db.run`, or `rows` for `db.all`.

**Example (`findUserByEmail`):**

```javascript
const findUserByEmail = (email) => {
 return new Promise((resolve, reject) => {
    // Raw SQL with placeholder
    db.get('SELECT * FROM users WHERE email = ?',
      // Parameter array
      [email],
      // Callback
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return reject(err); // Reject on error
        }
        resolve(row); // Resolve with row (or undefined)
      });
  });
};
```

**Future Considerations:**

*   If database logic becomes significantly complex or repetitive across many files, we may revisit introducing a lightweight Repository pattern (still potentially using raw SQL) or evaluate an ORM *at that time*. For now, stick to the direct Promise-wrapped approach.

---

*Add other sections as needed (e.g., Authentication Flow, Error Handling, Logging)* 