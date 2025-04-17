## Promises Summary (Based on our Discussion)

*   A `Promise` in JavaScript is an object that acts as a **placeholder** or **IOU** for a value that will be available later, resulting from an **asynchronous operation** (like a database query or API call).
*   It represents the *eventual completion* (success) or *failure* of that operation.
*   A `Promise` starts in a **`pending`** state. It eventually transitions to either:
    *   **`fulfilled`**: The operation succeeded, and the Promise holds the resulting value.
    *   **`rejected`**: The operation failed, and the Promise holds the reason (an error).
*   You can create a `Promise` manually using `new Promise((resolve, reject) => { ... })`.
    *   The function passed in is the **executor**.
    *   Inside the executor, you perform the async task.
    *   You call `resolve(value)` when the task succeeds.
    *   You call `reject(error)` when the task fails.
    *   This is often used to wrap older APIs that use **callbacks**.
*   **`async/await`** syntax is built *on top of* Promises. It provides a cleaner way to work with them:
    *   An `async` function implicitly returns a `Promise`.
    *   `await` pauses the `async` function until a `Promise` settles, returning the fulfilled value or throwing the rejected error.
*   Using Promises allows Node.js to handle asynchronous operations **without blocking** the main thread, enabling **concurrency** by letting other code run while waiting for I/O.
*   You can store a `Promise` variable to check its status or retrieve its result later, without using `await` immediately, allowing your function to continue executing other code.
