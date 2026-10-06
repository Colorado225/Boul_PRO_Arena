import {SetMetadata} from '@nestjs/common';
import type {Permission} from '@boul/domain';

export const PERMISSIONS_METADATA='boul:required-permissions';
export const RequirePermissions=(...permissions:Permission[])=>SetMetadata(PERMISSIONS_METADATA,permissions);
