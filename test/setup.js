global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };