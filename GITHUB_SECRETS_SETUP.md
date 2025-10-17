# GitHub Secrets Setup

This document explains how to configure GitHub secrets for automatic `.env` file generation during CI/CD deployment.

## Overview

The application requires environment variables to connect to Azure Blob Storage. During the CI/CD process, a `.env` file is automatically created from GitHub secrets and deployed with the application.

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### Navigation to Secrets
1. Go to your GitHub repository
2. Click on **Settings**
3. In the left sidebar, click on **Secrets and variables** → **Actions**
4. Click **New repository secret** to add each secret

### Secrets to Configure

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AZURE_PHOTO_STORAGE_URL` | Azure Blob Storage URL for photo container with SAS token | `https://ckcopilot.blob.core.windows.net/photo?sp=racwdli&st=...` |
| `AZURE_COMMENT_STORAGE_URL` | Azure Blob Storage URL for comment container with SAS token | `https://ckcopilot.blob.core.windows.net/comment?sp=racwdli&st=...` |
| `AZURE_STORAGE_ACCOUNT` | Azure Storage account name | `ckcopilot` |
| `AZURE_PHOTO_CONTAINER` | Name of the photo container | `photo` |
| `AZURE_COMMENT_CONTAINER` | Name of the comment container | `comment` |

## How to Get the Values

### Azure Storage URLs with SAS Tokens

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Storage Account
3. Select **Containers** from the left menu
4. Click on the container (e.g., `photo` or `comment`)
5. Click **Shared access tokens** or **Generate SAS**
6. Configure the following permissions:
   - Read (r)
   - Add (a)
   - Create (c)
   - Write (w)
   - Delete (d)
   - List (l)
7. Set an appropriate expiration date
8. Click **Generate SAS token and URL**
9. Copy the **Blob SAS URL** - this is your complete URL with SAS token

### Storage Account and Container Names

These are visible in the Azure Portal:
- **Storage Account**: The name of your Azure Storage account
- **Container Names**: The names of your containers (typically `photo` and `comment`)

## How It Works

1. When code is pushed to the `main` branch, the GitHub Actions workflow is triggered
2. During the build job, a step creates a `.env` file using the configured secrets
3. The build process uses this `.env` file to access environment variables
4. The `.env` file is included in the deployment artifact
5. The application is deployed to Azure with the `.env` file

## Workflow Configuration

The `.env` file creation is handled in `.github/workflows/main_ckcopilotapp.yml`:

```yaml
- name: Create .env file from GitHub secrets
  run: |
    cat > .env << EOF
    # Azure Blob Storage Configuration
    AZURE_PHOTO_STORAGE_URL=${{ secrets.AZURE_PHOTO_STORAGE_URL }}
    AZURE_COMMENT_STORAGE_URL=${{ secrets.AZURE_COMMENT_STORAGE_URL }}
    AZURE_STORAGE_ACCOUNT=${{ secrets.AZURE_STORAGE_ACCOUNT }}
    AZURE_PHOTO_CONTAINER=${{ secrets.AZURE_PHOTO_CONTAINER }}
    AZURE_COMMENT_CONTAINER=${{ secrets.AZURE_COMMENT_CONTAINER }}
    EOF
```

## Local Development

For local development, create a `.env` file manually by copying `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env` with your actual Azure Storage credentials. The `.env` file is excluded from version control via `.gitignore`.

## Security Notes

- **Never commit the `.env` file to version control** - it contains sensitive credentials
- Keep SAS tokens secure and rotate them regularly
- Set appropriate expiration dates for SAS tokens
- Use minimal required permissions for SAS tokens
- Monitor your Azure Storage access logs for unauthorized access

## Troubleshooting

### Build fails with "not exported by virtual:env/static/private"
This means the `.env` file is missing or the secrets are not configured. Ensure all required secrets are set in GitHub.

### Deployment succeeds but app cannot access Azure Storage
- Check that SAS tokens have not expired
- Verify that SAS tokens have the correct permissions (racwdli)
- Ensure the container names match between secrets and Azure Portal
- Check Azure Storage firewall settings

## References

- [.env.example](/.env.example) - Template for environment variables
- [AZURE_SETUP.md](/AZURE_SETUP.md) - Detailed Azure setup instructions
- [SAS_TOKEN_MANAGEMENT.md](/SAS_TOKEN_MANAGEMENT.md) - SAS token management guide
