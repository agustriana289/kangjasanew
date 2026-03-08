import * as React from 'react';

declare global {
  namespace React {
    type ComponentType<P = {}> = import('react').ComponentType<P>;
    type ReactNode = import('react').ReactNode;
  }
}
