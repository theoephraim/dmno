import { DmnoBaseTypes, defineDmnoService } from 'dmno';

export default defineDmnoService({
  name: 'astro-netlify',
  settings: {
    dynamicConfig: 'default_static',
  },
  schema: {
    PUBLIC_DYNAMIC: {
      value: 'public-dynamic-init',
      dynamic: true,
    },
    PUBLIC_STATIC: {
      value: 'public-static-init',
    },

    SECRET_STATIC: {
      value: 'secret-static',
      dynamic: false,
      sensitive: true,
    },
    SECRET_DYNAMIC: {
      value: 'secret-dynamic',
      dynamic: true,
      sensitive: true,
    },
    BUILD_VAR: {},
    UI_VAR: {},
  },
});
