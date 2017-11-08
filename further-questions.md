# Further Questions

- [ ] Authentication tokens
- [ ] `POST venues & events` if auto-incrementing, do we have to accept IDs?
      If providing an ID, REST semantics imply that PUT should be used instead.
- [ ] Are we restricted in which version of Node we may use?
      The latest version has far better support for Promises and modern JS, for example.
- [ ] When we submit our assignments, are we expected to have a hosted version of it ready to be run,
      or are we meant to create a bootstrapping script for you to be able to build it from scratch?
- [ ] For `auth_token`, are we allowed to use JWTs?
- [ ] For POST `events/add`: should `venue_id` be an integer, or a string of form 'v_1'?
