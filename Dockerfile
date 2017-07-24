FROM node:alpine
COPY *.js* /
RUN npm config set registry http://registry.npmjs.org/
RUN npm install && npm link
ADD script.sh /script.sh
ENTRYPOINT ["/script.sh"]
