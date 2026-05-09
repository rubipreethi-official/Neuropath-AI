FROM n8nio/n8n:latest

# Hugging Face Spaces run on port 7860 by default
ENV N8N_PORT=7860
ENV N8N_LISTEN_ADDRESS=0.0.0.0
ENV NODE_ENV=production
ENV WEBHOOK_URL=https://${SPACE_HOST}

EXPOSE 7860

# Command to run n8n
CMD ["n8n", "start"]
