# Pushing to GitHub & protecting secrets

## First-time push (from your machine)

```bash
cd /path/to/by-celeste-ecommerce
git init
git add .
git commit -m "Initial commit: By Celeste full-stack storefront"
git branch -M main
git remote add origin https://github.com/Sameeryadav12/by-celeste-ecommerce.git
git push -u origin main
```

If GitHub prompts for credentials, use a **Personal Access Token** (classic: `repo` scope) as the password, or GitHub CLI (`gh auth login`).

## If the remote already has a README (unlikely for empty repo)

Use `git pull origin main --allow-unrelated-histories` then merge, or force-push only if you intend to replace remote history entirely.

## Never commit

- `backend/.env`, `frontend/.env`, `frontend/.env.local`
- Square tokens, `JWT_ACCESS_SECRET`, production `DATABASE_URL`

Run `git status` and confirm no `.env` files are staged before every push.
