FROM oven/bun:alpine AS base

ARG BACKEND_URL=http://host.docker.internal:8000/
WORKDIR /railsurvey

# install node-prune (official binary for Alpine)
RUN wget -O - https://gobinaries.com/tj/node-prune | sh

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY railsurvey/package.json railsurvey/bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY railsurvey/package.json railsurvey/bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY railsurvey/. .
WORKDIR /railsurvey
RUN bun test
RUN bun run build

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test
RUN rm -rf .next
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /railsurvey/. .

# clean node_modules
RUN node-prune node_modules

# run the app
USER bun
EXPOSE 4000/tcp 
ENV PORT=4000
CMD ["bun", "run", "start"]