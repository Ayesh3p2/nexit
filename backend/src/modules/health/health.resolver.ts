import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class HealthResolver {
  @Query(() => String)
  async healthCheck(): Promise<string> {
    return 'OK';
  }
}
