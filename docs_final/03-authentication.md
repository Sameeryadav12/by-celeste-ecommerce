# Authentication (Login & Accounts)

## Purpose

This document explains—in plain English—how By Celeste handles accounts and secure login on the **backend**, and what customers can do on the **website** as of Step 2.

## What is covered so far

- What “login” and “signup” mean on this site  
- How the website uses secure cookies to recognise a signed-in customer  
- What the Signup, Login, and Account pages do today  
- How customers can safely log out when they are finished

---

## What signup, login, logout, and “stay signed in” mean

- **Sign up** — A new customer creates an account. The system checks their details, saves a **secure password fingerprint** (not the raw password), and starts a logged-in session.
- **Log in** — A returning user proves they know their password. If correct, the system starts a new session.
- **Stay signed in** — For a period of time, the browser automatically sends a **secure HTTP-only cookie** so the backend can recognise the user without asking for the password on every click. The session eventually **expires** and can be renewed by logging in again.
- **Log out** — The session cookie is cleared so the browser is no longer treated as logged in.

> Note: Step 1 implemented these behaviours as **API endpoints**. Step 2 adds the **customer-facing pages** that use them.

## What we store for each user (high level)

For each account we keep identity and access information, for example:

- First and last name  
- Email address (unique)  
- **Role** (customer, wholesale, or admin—wholesale and admin are not created via public signup today)  
- Whether the account is **active**  
- **Timestamps** (created / updated; optional last login for future reporting)

We **do not** return password secrets in API responses.

## Security (high level, non-technical)

- Passwords are validated for strength on signup.  
- Passwords are stored using **strong hashing** (so even staff with database access do not see the real password).  
- Sessions use a **JWT** stored in an **HTTP-only cookie**, with settings that suit **local development** and can be tightened for **production** (for example, stricter cookie flags behind HTTPS).  
- Errors are written to be **clear for users and beginners**, without leaking internal system details.

## Simple happy-path flow (customer)

1. **Customer creates an account** — They provide name, email, and password; the system saves the account as a **customer**.  
2. **Customer logs in** — Email + password are checked; a session cookie is set.  
3. **The website recognises them securely** — Later requests include the cookie; the backend verifies it and knows **which user** is asking.  
4. **Customer logs out** — The cookie is cleared; the next “who am I?” check shows they are not logged in.

## What the Signup page does (Step 2)

- Lets a new customer enter their first name, last name, email, and password.  
- Checks that the details are filled in sensibly before sending anything to the server (for example, strong password rules and a valid email format).  
- Shows clear messages on the screen if something is wrong, including when an email is already in use.  
- When everything is correct, creates the account, signs the customer in, and takes them to their basic Account page.

## What the Login page does (Step 2)

- Lets a returning customer enter their email and password.  
- Checks that the email looks valid and that a password has been entered.  
- Shows a simple message if the details do not match what is on record.  
- On success, signs the customer in and takes them to their Account page.

## What the Account page shows today (Step 2)

- A short welcome area confirming the customer’s **first name, last name, email, and account type (role)**.  
- A simple note explaining that orders and loyalty information will be added here in a later step.  
- A clear **Sign out** button.

Only signed-in customers can see this page. If someone is not signed in and tries to visit it directly, they are taken to the Login page first.

## What Logout does (Step 2)

- Clears the secure cookie that keeps the customer signed in.  
- Returns the browser to a “not signed in” state, so protected pages like the Account area are no longer available until the customer logs in again.

## Simple customer flow on the website (Step 2)

1. **Customer creates an account** — They use the Signup page with their details.  
2. **Customer signs in** — Either straight after signup or later using the Login page.  
3. **Website recognises them** — The cookie from the backend lets the site know who is using it, without asking for the password again on every page.  
4. **Customer views their basic account area** — They can see their key details and know they are signed in.  
5. **Customer signs out safely** — They use the Sign out button, which clears the session cookie.

## Optional: first admin user (not public signup)

A **one-time script** can create a single **admin** user using values from the server environment. This is separate from customer signup and is meant for trusted setup only. See `backend` run instructions and `.env.example` for `ADMIN_BOOTSTRAP_*` variables.

