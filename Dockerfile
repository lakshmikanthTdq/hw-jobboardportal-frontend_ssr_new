# Use a distroless Node.js image as the builder
FROM --platform=linux/amd64 node:16-alpine as builder

# Set the working directory
WORKDIR /usr/src/app

# Copy only the necessary files for building
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --force

# Copy the rest of the source code
COPY . .

# Build the React.js application
# Set environment variables
ENV NODE_OPTIONS=--max_old_space_size=2048
ARG environment
RUN npm run build:${environment}

# Use a  Nginx image for the final image
FROM --platform=linux/amd64 nginx:alpine

# Copy the build output to the Nginx html directory
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port
EXPOSE 3006

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]