# Ansible deployment (Phase 1)

This playbook deploys the Travel stack using `docker compose` on the target host.

## Requirements
- Ansible installed on the control machine
- Docker + Docker Compose v2 installed on the target host

## Usage
From the repo root:

```bash
ansible-playbook -i ansible/inventory.ini ansible/site.yml
```

### Notes
- This playbook deploys to `localhost` by default (see `ansible/inventory.ini`).
- If you deploy to a remote server, replace the inventory host and ensure SSH access.

