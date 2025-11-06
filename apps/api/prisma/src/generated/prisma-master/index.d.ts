
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model TenantBranding
 * 
 */
export type TenantBranding = $Result.DefaultSelection<Prisma.$TenantBrandingPayload>
/**
 * Model TenantModule
 * 
 */
export type TenantModule = $Result.DefaultSelection<Prisma.$TenantModulePayload>
/**
 * Model TenantStats
 * 
 */
export type TenantStats = $Result.DefaultSelection<Prisma.$TenantStatsPayload>
/**
 * Model GlobalStats
 * 
 */
export type GlobalStats = $Result.DefaultSelection<Prisma.$GlobalStatsPayload>
/**
 * Model TenantCashbackConfig
 * 
 */
export type TenantCashbackConfig = $Result.DefaultSelection<Prisma.$TenantCashbackConfigPayload>
/**
 * Model TenantWithdrawalConfig
 * 
 */
export type TenantWithdrawalConfig = $Result.DefaultSelection<Prisma.$TenantWithdrawalConfigPayload>
/**
 * Model TenantAdmin
 * 
 */
export type TenantAdmin = $Result.DefaultSelection<Prisma.$TenantAdminPayload>
/**
 * Model SuperAdmin
 * 
 */
export type SuperAdmin = $Result.DefaultSelection<Prisma.$SuperAdminPayload>
/**
 * Model TenantApiKey
 * 
 */
export type TenantApiKey = $Result.DefaultSelection<Prisma.$TenantApiKeyPayload>
/**
 * Model TenantUsageStats
 * 
 */
export type TenantUsageStats = $Result.DefaultSelection<Prisma.$TenantUsageStatsPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TenantStatus: {
  trial: 'trial',
  active: 'active',
  suspended: 'suspended',
  cancelled: 'cancelled',
  expired: 'expired'
};

export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus]


export const SubscriptionPlan: {
  BASIC: 'BASIC',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE'
};

export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan]


export const SubscriptionStatus: {
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  SUSPENDED: 'SUSPENDED',
  CANCELED: 'CANCELED'
};

export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus]


export const ModuleKey: {
  marketplace: 'marketplace',
  internet: 'internet',
  cinema: 'cinema',
  telemedicine: 'telemedicine',
  giftcards: 'giftcards',
  insurance: 'insurance',
  streaming: 'streaming',
  referrals: 'referrals',
  cashback: 'cashback',
  telecom: 'telecom'
};

export type ModuleKey = (typeof ModuleKey)[keyof typeof ModuleKey]


export const AdminRole: {
  admin: 'admin',
  manager: 'manager',
  support: 'support'
};

export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole]

}

export type TenantStatus = $Enums.TenantStatus

export const TenantStatus: typeof $Enums.TenantStatus

export type SubscriptionPlan = $Enums.SubscriptionPlan

export const SubscriptionPlan: typeof $Enums.SubscriptionPlan

export type SubscriptionStatus = $Enums.SubscriptionStatus

export const SubscriptionStatus: typeof $Enums.SubscriptionStatus

export type ModuleKey = $Enums.ModuleKey

export const ModuleKey: typeof $Enums.ModuleKey

export type AdminRole = $Enums.AdminRole

export const AdminRole: typeof $Enums.AdminRole

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantBranding`: Exposes CRUD operations for the **TenantBranding** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantBrandings
    * const tenantBrandings = await prisma.tenantBranding.findMany()
    * ```
    */
  get tenantBranding(): Prisma.TenantBrandingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantModule`: Exposes CRUD operations for the **TenantModule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantModules
    * const tenantModules = await prisma.tenantModule.findMany()
    * ```
    */
  get tenantModule(): Prisma.TenantModuleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantStats`: Exposes CRUD operations for the **TenantStats** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantStats
    * const tenantStats = await prisma.tenantStats.findMany()
    * ```
    */
  get tenantStats(): Prisma.TenantStatsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.globalStats`: Exposes CRUD operations for the **GlobalStats** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GlobalStats
    * const globalStats = await prisma.globalStats.findMany()
    * ```
    */
  get globalStats(): Prisma.GlobalStatsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantCashbackConfig`: Exposes CRUD operations for the **TenantCashbackConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantCashbackConfigs
    * const tenantCashbackConfigs = await prisma.tenantCashbackConfig.findMany()
    * ```
    */
  get tenantCashbackConfig(): Prisma.TenantCashbackConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantWithdrawalConfig`: Exposes CRUD operations for the **TenantWithdrawalConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantWithdrawalConfigs
    * const tenantWithdrawalConfigs = await prisma.tenantWithdrawalConfig.findMany()
    * ```
    */
  get tenantWithdrawalConfig(): Prisma.TenantWithdrawalConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantAdmin`: Exposes CRUD operations for the **TenantAdmin** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantAdmins
    * const tenantAdmins = await prisma.tenantAdmin.findMany()
    * ```
    */
  get tenantAdmin(): Prisma.TenantAdminDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.superAdmin`: Exposes CRUD operations for the **SuperAdmin** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SuperAdmins
    * const superAdmins = await prisma.superAdmin.findMany()
    * ```
    */
  get superAdmin(): Prisma.SuperAdminDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantApiKey`: Exposes CRUD operations for the **TenantApiKey** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantApiKeys
    * const tenantApiKeys = await prisma.tenantApiKey.findMany()
    * ```
    */
  get tenantApiKey(): Prisma.TenantApiKeyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantUsageStats`: Exposes CRUD operations for the **TenantUsageStats** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantUsageStats
    * const tenantUsageStats = await prisma.tenantUsageStats.findMany()
    * ```
    */
  get tenantUsageStats(): Prisma.TenantUsageStatsDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.18.0
   * Query Engine version: 34b5a692b7bd79939a9a2c3ef97d816e749cda2f
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Tenant: 'Tenant',
    TenantBranding: 'TenantBranding',
    TenantModule: 'TenantModule',
    TenantStats: 'TenantStats',
    GlobalStats: 'GlobalStats',
    TenantCashbackConfig: 'TenantCashbackConfig',
    TenantWithdrawalConfig: 'TenantWithdrawalConfig',
    TenantAdmin: 'TenantAdmin',
    SuperAdmin: 'SuperAdmin',
    TenantApiKey: 'TenantApiKey',
    TenantUsageStats: 'TenantUsageStats'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "tenant" | "tenantBranding" | "tenantModule" | "tenantStats" | "globalStats" | "tenantCashbackConfig" | "tenantWithdrawalConfig" | "tenantAdmin" | "superAdmin" | "tenantApiKey" | "tenantUsageStats"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      TenantBranding: {
        payload: Prisma.$TenantBrandingPayload<ExtArgs>
        fields: Prisma.TenantBrandingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantBrandingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantBrandingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantBrandingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantBrandingPayload>
          }
          findFirst: {
            args: Prisma.TenantBrandingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantBrandingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantBrandingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantBrandingPayload>
          }
          findMany: {
            args: Prisma.TenantBrandingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantBrandingPayload>[]
          }
          create: {
            args: Prisma.TenantBrandingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantBrandingPayload>
          }
          createMany: {
            args: Prisma.TenantBrandingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantBrandingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantBrandingPayload>[]
          }
          delete: {
            args: Prisma.TenantBrandingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantBrandingPayload>
          }
          update: {
            args: Prisma.TenantBrandingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantBrandingPayload>
          }
          deleteMany: {
            args: Prisma.TenantBrandingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantBrandingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantBrandingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantBrandingPayload>[]
          }
          upsert: {
            args: Prisma.TenantBrandingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantBrandingPayload>
          }
          aggregate: {
            args: Prisma.TenantBrandingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantBranding>
          }
          groupBy: {
            args: Prisma.TenantBrandingGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantBrandingGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantBrandingCountArgs<ExtArgs>
            result: $Utils.Optional<TenantBrandingCountAggregateOutputType> | number
          }
        }
      }
      TenantModule: {
        payload: Prisma.$TenantModulePayload<ExtArgs>
        fields: Prisma.TenantModuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantModuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantModuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          findFirst: {
            args: Prisma.TenantModuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantModuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          findMany: {
            args: Prisma.TenantModuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>[]
          }
          create: {
            args: Prisma.TenantModuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          createMany: {
            args: Prisma.TenantModuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantModuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>[]
          }
          delete: {
            args: Prisma.TenantModuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          update: {
            args: Prisma.TenantModuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          deleteMany: {
            args: Prisma.TenantModuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantModuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantModuleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>[]
          }
          upsert: {
            args: Prisma.TenantModuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          aggregate: {
            args: Prisma.TenantModuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantModule>
          }
          groupBy: {
            args: Prisma.TenantModuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantModuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantModuleCountArgs<ExtArgs>
            result: $Utils.Optional<TenantModuleCountAggregateOutputType> | number
          }
        }
      }
      TenantStats: {
        payload: Prisma.$TenantStatsPayload<ExtArgs>
        fields: Prisma.TenantStatsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantStatsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantStatsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantStatsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantStatsPayload>
          }
          findFirst: {
            args: Prisma.TenantStatsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantStatsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantStatsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantStatsPayload>
          }
          findMany: {
            args: Prisma.TenantStatsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantStatsPayload>[]
          }
          create: {
            args: Prisma.TenantStatsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantStatsPayload>
          }
          createMany: {
            args: Prisma.TenantStatsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantStatsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantStatsPayload>[]
          }
          delete: {
            args: Prisma.TenantStatsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantStatsPayload>
          }
          update: {
            args: Prisma.TenantStatsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantStatsPayload>
          }
          deleteMany: {
            args: Prisma.TenantStatsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantStatsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantStatsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantStatsPayload>[]
          }
          upsert: {
            args: Prisma.TenantStatsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantStatsPayload>
          }
          aggregate: {
            args: Prisma.TenantStatsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantStats>
          }
          groupBy: {
            args: Prisma.TenantStatsGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantStatsGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantStatsCountArgs<ExtArgs>
            result: $Utils.Optional<TenantStatsCountAggregateOutputType> | number
          }
        }
      }
      GlobalStats: {
        payload: Prisma.$GlobalStatsPayload<ExtArgs>
        fields: Prisma.GlobalStatsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GlobalStatsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalStatsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GlobalStatsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalStatsPayload>
          }
          findFirst: {
            args: Prisma.GlobalStatsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalStatsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GlobalStatsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalStatsPayload>
          }
          findMany: {
            args: Prisma.GlobalStatsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalStatsPayload>[]
          }
          create: {
            args: Prisma.GlobalStatsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalStatsPayload>
          }
          createMany: {
            args: Prisma.GlobalStatsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GlobalStatsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalStatsPayload>[]
          }
          delete: {
            args: Prisma.GlobalStatsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalStatsPayload>
          }
          update: {
            args: Prisma.GlobalStatsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalStatsPayload>
          }
          deleteMany: {
            args: Prisma.GlobalStatsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GlobalStatsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GlobalStatsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalStatsPayload>[]
          }
          upsert: {
            args: Prisma.GlobalStatsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalStatsPayload>
          }
          aggregate: {
            args: Prisma.GlobalStatsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGlobalStats>
          }
          groupBy: {
            args: Prisma.GlobalStatsGroupByArgs<ExtArgs>
            result: $Utils.Optional<GlobalStatsGroupByOutputType>[]
          }
          count: {
            args: Prisma.GlobalStatsCountArgs<ExtArgs>
            result: $Utils.Optional<GlobalStatsCountAggregateOutputType> | number
          }
        }
      }
      TenantCashbackConfig: {
        payload: Prisma.$TenantCashbackConfigPayload<ExtArgs>
        fields: Prisma.TenantCashbackConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantCashbackConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantCashbackConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantCashbackConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantCashbackConfigPayload>
          }
          findFirst: {
            args: Prisma.TenantCashbackConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantCashbackConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantCashbackConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantCashbackConfigPayload>
          }
          findMany: {
            args: Prisma.TenantCashbackConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantCashbackConfigPayload>[]
          }
          create: {
            args: Prisma.TenantCashbackConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantCashbackConfigPayload>
          }
          createMany: {
            args: Prisma.TenantCashbackConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCashbackConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantCashbackConfigPayload>[]
          }
          delete: {
            args: Prisma.TenantCashbackConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantCashbackConfigPayload>
          }
          update: {
            args: Prisma.TenantCashbackConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantCashbackConfigPayload>
          }
          deleteMany: {
            args: Prisma.TenantCashbackConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantCashbackConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantCashbackConfigUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantCashbackConfigPayload>[]
          }
          upsert: {
            args: Prisma.TenantCashbackConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantCashbackConfigPayload>
          }
          aggregate: {
            args: Prisma.TenantCashbackConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantCashbackConfig>
          }
          groupBy: {
            args: Prisma.TenantCashbackConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantCashbackConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCashbackConfigCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCashbackConfigCountAggregateOutputType> | number
          }
        }
      }
      TenantWithdrawalConfig: {
        payload: Prisma.$TenantWithdrawalConfigPayload<ExtArgs>
        fields: Prisma.TenantWithdrawalConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantWithdrawalConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantWithdrawalConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantWithdrawalConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantWithdrawalConfigPayload>
          }
          findFirst: {
            args: Prisma.TenantWithdrawalConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantWithdrawalConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantWithdrawalConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantWithdrawalConfigPayload>
          }
          findMany: {
            args: Prisma.TenantWithdrawalConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantWithdrawalConfigPayload>[]
          }
          create: {
            args: Prisma.TenantWithdrawalConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantWithdrawalConfigPayload>
          }
          createMany: {
            args: Prisma.TenantWithdrawalConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantWithdrawalConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantWithdrawalConfigPayload>[]
          }
          delete: {
            args: Prisma.TenantWithdrawalConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantWithdrawalConfigPayload>
          }
          update: {
            args: Prisma.TenantWithdrawalConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantWithdrawalConfigPayload>
          }
          deleteMany: {
            args: Prisma.TenantWithdrawalConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantWithdrawalConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantWithdrawalConfigUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantWithdrawalConfigPayload>[]
          }
          upsert: {
            args: Prisma.TenantWithdrawalConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantWithdrawalConfigPayload>
          }
          aggregate: {
            args: Prisma.TenantWithdrawalConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantWithdrawalConfig>
          }
          groupBy: {
            args: Prisma.TenantWithdrawalConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantWithdrawalConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantWithdrawalConfigCountArgs<ExtArgs>
            result: $Utils.Optional<TenantWithdrawalConfigCountAggregateOutputType> | number
          }
        }
      }
      TenantAdmin: {
        payload: Prisma.$TenantAdminPayload<ExtArgs>
        fields: Prisma.TenantAdminFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantAdminFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAdminPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantAdminFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAdminPayload>
          }
          findFirst: {
            args: Prisma.TenantAdminFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAdminPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantAdminFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAdminPayload>
          }
          findMany: {
            args: Prisma.TenantAdminFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAdminPayload>[]
          }
          create: {
            args: Prisma.TenantAdminCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAdminPayload>
          }
          createMany: {
            args: Prisma.TenantAdminCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantAdminCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAdminPayload>[]
          }
          delete: {
            args: Prisma.TenantAdminDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAdminPayload>
          }
          update: {
            args: Prisma.TenantAdminUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAdminPayload>
          }
          deleteMany: {
            args: Prisma.TenantAdminDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantAdminUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantAdminUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAdminPayload>[]
          }
          upsert: {
            args: Prisma.TenantAdminUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantAdminPayload>
          }
          aggregate: {
            args: Prisma.TenantAdminAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantAdmin>
          }
          groupBy: {
            args: Prisma.TenantAdminGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantAdminGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantAdminCountArgs<ExtArgs>
            result: $Utils.Optional<TenantAdminCountAggregateOutputType> | number
          }
        }
      }
      SuperAdmin: {
        payload: Prisma.$SuperAdminPayload<ExtArgs>
        fields: Prisma.SuperAdminFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SuperAdminFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SuperAdminFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          findFirst: {
            args: Prisma.SuperAdminFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SuperAdminFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          findMany: {
            args: Prisma.SuperAdminFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          create: {
            args: Prisma.SuperAdminCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          createMany: {
            args: Prisma.SuperAdminCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SuperAdminCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          delete: {
            args: Prisma.SuperAdminDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          update: {
            args: Prisma.SuperAdminUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          deleteMany: {
            args: Prisma.SuperAdminDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SuperAdminUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SuperAdminUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          upsert: {
            args: Prisma.SuperAdminUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          aggregate: {
            args: Prisma.SuperAdminAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSuperAdmin>
          }
          groupBy: {
            args: Prisma.SuperAdminGroupByArgs<ExtArgs>
            result: $Utils.Optional<SuperAdminGroupByOutputType>[]
          }
          count: {
            args: Prisma.SuperAdminCountArgs<ExtArgs>
            result: $Utils.Optional<SuperAdminCountAggregateOutputType> | number
          }
        }
      }
      TenantApiKey: {
        payload: Prisma.$TenantApiKeyPayload<ExtArgs>
        fields: Prisma.TenantApiKeyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantApiKeyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantApiKeyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          findFirst: {
            args: Prisma.TenantApiKeyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantApiKeyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          findMany: {
            args: Prisma.TenantApiKeyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>[]
          }
          create: {
            args: Prisma.TenantApiKeyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          createMany: {
            args: Prisma.TenantApiKeyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantApiKeyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>[]
          }
          delete: {
            args: Prisma.TenantApiKeyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          update: {
            args: Prisma.TenantApiKeyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          deleteMany: {
            args: Prisma.TenantApiKeyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantApiKeyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantApiKeyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>[]
          }
          upsert: {
            args: Prisma.TenantApiKeyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          aggregate: {
            args: Prisma.TenantApiKeyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantApiKey>
          }
          groupBy: {
            args: Prisma.TenantApiKeyGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantApiKeyGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantApiKeyCountArgs<ExtArgs>
            result: $Utils.Optional<TenantApiKeyCountAggregateOutputType> | number
          }
        }
      }
      TenantUsageStats: {
        payload: Prisma.$TenantUsageStatsPayload<ExtArgs>
        fields: Prisma.TenantUsageStatsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantUsageStatsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsageStatsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantUsageStatsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsageStatsPayload>
          }
          findFirst: {
            args: Prisma.TenantUsageStatsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsageStatsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantUsageStatsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsageStatsPayload>
          }
          findMany: {
            args: Prisma.TenantUsageStatsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsageStatsPayload>[]
          }
          create: {
            args: Prisma.TenantUsageStatsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsageStatsPayload>
          }
          createMany: {
            args: Prisma.TenantUsageStatsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantUsageStatsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsageStatsPayload>[]
          }
          delete: {
            args: Prisma.TenantUsageStatsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsageStatsPayload>
          }
          update: {
            args: Prisma.TenantUsageStatsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsageStatsPayload>
          }
          deleteMany: {
            args: Prisma.TenantUsageStatsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUsageStatsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantUsageStatsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsageStatsPayload>[]
          }
          upsert: {
            args: Prisma.TenantUsageStatsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsageStatsPayload>
          }
          aggregate: {
            args: Prisma.TenantUsageStatsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantUsageStats>
          }
          groupBy: {
            args: Prisma.TenantUsageStatsGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantUsageStatsGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantUsageStatsCountArgs<ExtArgs>
            result: $Utils.Optional<TenantUsageStatsCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    tenant?: TenantOmit
    tenantBranding?: TenantBrandingOmit
    tenantModule?: TenantModuleOmit
    tenantStats?: TenantStatsOmit
    globalStats?: GlobalStatsOmit
    tenantCashbackConfig?: TenantCashbackConfigOmit
    tenantWithdrawalConfig?: TenantWithdrawalConfigOmit
    tenantAdmin?: TenantAdminOmit
    superAdmin?: SuperAdminOmit
    tenantApiKey?: TenantApiKeyOmit
    tenantUsageStats?: TenantUsageStatsOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    modules: number
    admins: number
    apiKeys: number
    usageStats: number
  }

  export type TenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    modules?: boolean | TenantCountOutputTypeCountModulesArgs
    admins?: boolean | TenantCountOutputTypeCountAdminsArgs
    apiKeys?: boolean | TenantCountOutputTypeCountApiKeysArgs
    usageStats?: boolean | TenantCountOutputTypeCountUsageStatsArgs
  }

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountModulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantModuleWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountAdminsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantAdminWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountApiKeysArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantApiKeyWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountUsageStatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantUsageStatsWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _avg: TenantAvgAggregateOutputType | null
    _sum: TenantSumAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantAvgAggregateOutputType = {
    databasePort: number | null
    maxUsers: number | null
    maxAdmins: number | null
    maxStorageGB: number | null
    monthlyFee: Decimal | null
    totalBilled: Decimal | null
    outstandingBalance: Decimal | null
  }

  export type TenantSumAggregateOutputType = {
    databasePort: number | null
    maxUsers: number | null
    maxAdmins: number | null
    maxStorageGB: number | null
    monthlyFee: Decimal | null
    totalBilled: Decimal | null
    outstandingBalance: Decimal | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    slug: string | null
    companyName: string | null
    companyDocument: string | null
    status: $Enums.TenantStatus | null
    databaseHost: string | null
    databasePort: number | null
    databaseName: string | null
    databaseUser: string | null
    databasePassword: string | null
    subdomain: string | null
    customDomain: string | null
    adminSubdomain: string | null
    maxUsers: number | null
    maxAdmins: number | null
    maxStorageGB: number | null
    subscriptionPlan: $Enums.SubscriptionPlan | null
    subscriptionStatus: $Enums.SubscriptionStatus | null
    monthlyFee: Decimal | null
    trialEndsAt: Date | null
    nextBillingDate: Date | null
    lastBillingDate: Date | null
    totalBilled: Decimal | null
    outstandingBalance: Decimal | null
    contactName: string | null
    contactEmail: string | null
    contactPhone: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    slug: string | null
    companyName: string | null
    companyDocument: string | null
    status: $Enums.TenantStatus | null
    databaseHost: string | null
    databasePort: number | null
    databaseName: string | null
    databaseUser: string | null
    databasePassword: string | null
    subdomain: string | null
    customDomain: string | null
    adminSubdomain: string | null
    maxUsers: number | null
    maxAdmins: number | null
    maxStorageGB: number | null
    subscriptionPlan: $Enums.SubscriptionPlan | null
    subscriptionStatus: $Enums.SubscriptionStatus | null
    monthlyFee: Decimal | null
    trialEndsAt: Date | null
    nextBillingDate: Date | null
    lastBillingDate: Date | null
    totalBilled: Decimal | null
    outstandingBalance: Decimal | null
    contactName: string | null
    contactEmail: string | null
    contactPhone: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    slug: number
    companyName: number
    companyDocument: number
    status: number
    databaseHost: number
    databasePort: number
    databaseName: number
    databaseUser: number
    databasePassword: number
    subdomain: number
    customDomain: number
    adminSubdomain: number
    maxUsers: number
    maxAdmins: number
    maxStorageGB: number
    subscriptionPlan: number
    subscriptionStatus: number
    monthlyFee: number
    trialEndsAt: number
    nextBillingDate: number
    lastBillingDate: number
    totalBilled: number
    outstandingBalance: number
    contactName: number
    contactEmail: number
    contactPhone: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantAvgAggregateInputType = {
    databasePort?: true
    maxUsers?: true
    maxAdmins?: true
    maxStorageGB?: true
    monthlyFee?: true
    totalBilled?: true
    outstandingBalance?: true
  }

  export type TenantSumAggregateInputType = {
    databasePort?: true
    maxUsers?: true
    maxAdmins?: true
    maxStorageGB?: true
    monthlyFee?: true
    totalBilled?: true
    outstandingBalance?: true
  }

  export type TenantMinAggregateInputType = {
    id?: true
    slug?: true
    companyName?: true
    companyDocument?: true
    status?: true
    databaseHost?: true
    databasePort?: true
    databaseName?: true
    databaseUser?: true
    databasePassword?: true
    subdomain?: true
    customDomain?: true
    adminSubdomain?: true
    maxUsers?: true
    maxAdmins?: true
    maxStorageGB?: true
    subscriptionPlan?: true
    subscriptionStatus?: true
    monthlyFee?: true
    trialEndsAt?: true
    nextBillingDate?: true
    lastBillingDate?: true
    totalBilled?: true
    outstandingBalance?: true
    contactName?: true
    contactEmail?: true
    contactPhone?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    slug?: true
    companyName?: true
    companyDocument?: true
    status?: true
    databaseHost?: true
    databasePort?: true
    databaseName?: true
    databaseUser?: true
    databasePassword?: true
    subdomain?: true
    customDomain?: true
    adminSubdomain?: true
    maxUsers?: true
    maxAdmins?: true
    maxStorageGB?: true
    subscriptionPlan?: true
    subscriptionStatus?: true
    monthlyFee?: true
    trialEndsAt?: true
    nextBillingDate?: true
    lastBillingDate?: true
    totalBilled?: true
    outstandingBalance?: true
    contactName?: true
    contactEmail?: true
    contactPhone?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    slug?: true
    companyName?: true
    companyDocument?: true
    status?: true
    databaseHost?: true
    databasePort?: true
    databaseName?: true
    databaseUser?: true
    databasePassword?: true
    subdomain?: true
    customDomain?: true
    adminSubdomain?: true
    maxUsers?: true
    maxAdmins?: true
    maxStorageGB?: true
    subscriptionPlan?: true
    subscriptionStatus?: true
    monthlyFee?: true
    trialEndsAt?: true
    nextBillingDate?: true
    lastBillingDate?: true
    totalBilled?: true
    outstandingBalance?: true
    contactName?: true
    contactEmail?: true
    contactPhone?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TenantAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TenantSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _avg?: TenantAvgAggregateInputType
    _sum?: TenantSumAggregateInputType
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    slug: string
    companyName: string
    companyDocument: string
    status: $Enums.TenantStatus
    databaseHost: string
    databasePort: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain: string | null
    customDomain: string | null
    adminSubdomain: string | null
    maxUsers: number
    maxAdmins: number
    maxStorageGB: number
    subscriptionPlan: $Enums.SubscriptionPlan
    subscriptionStatus: $Enums.SubscriptionStatus
    monthlyFee: Decimal
    trialEndsAt: Date | null
    nextBillingDate: Date | null
    lastBillingDate: Date | null
    totalBilled: Decimal
    outstandingBalance: Decimal
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt: Date
    updatedAt: Date
    _count: TenantCountAggregateOutputType | null
    _avg: TenantAvgAggregateOutputType | null
    _sum: TenantSumAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    companyName?: boolean
    companyDocument?: boolean
    status?: boolean
    databaseHost?: boolean
    databasePort?: boolean
    databaseName?: boolean
    databaseUser?: boolean
    databasePassword?: boolean
    subdomain?: boolean
    customDomain?: boolean
    adminSubdomain?: boolean
    maxUsers?: boolean
    maxAdmins?: boolean
    maxStorageGB?: boolean
    subscriptionPlan?: boolean
    subscriptionStatus?: boolean
    monthlyFee?: boolean
    trialEndsAt?: boolean
    nextBillingDate?: boolean
    lastBillingDate?: boolean
    totalBilled?: boolean
    outstandingBalance?: boolean
    contactName?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    branding?: boolean | Tenant$brandingArgs<ExtArgs>
    modules?: boolean | Tenant$modulesArgs<ExtArgs>
    admins?: boolean | Tenant$adminsArgs<ExtArgs>
    apiKeys?: boolean | Tenant$apiKeysArgs<ExtArgs>
    usageStats?: boolean | Tenant$usageStatsArgs<ExtArgs>
    stats?: boolean | Tenant$statsArgs<ExtArgs>
    cashbackConfig?: boolean | Tenant$cashbackConfigArgs<ExtArgs>
    withdrawalConfig?: boolean | Tenant$withdrawalConfigArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    companyName?: boolean
    companyDocument?: boolean
    status?: boolean
    databaseHost?: boolean
    databasePort?: boolean
    databaseName?: boolean
    databaseUser?: boolean
    databasePassword?: boolean
    subdomain?: boolean
    customDomain?: boolean
    adminSubdomain?: boolean
    maxUsers?: boolean
    maxAdmins?: boolean
    maxStorageGB?: boolean
    subscriptionPlan?: boolean
    subscriptionStatus?: boolean
    monthlyFee?: boolean
    trialEndsAt?: boolean
    nextBillingDate?: boolean
    lastBillingDate?: boolean
    totalBilled?: boolean
    outstandingBalance?: boolean
    contactName?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    companyName?: boolean
    companyDocument?: boolean
    status?: boolean
    databaseHost?: boolean
    databasePort?: boolean
    databaseName?: boolean
    databaseUser?: boolean
    databasePassword?: boolean
    subdomain?: boolean
    customDomain?: boolean
    adminSubdomain?: boolean
    maxUsers?: boolean
    maxAdmins?: boolean
    maxStorageGB?: boolean
    subscriptionPlan?: boolean
    subscriptionStatus?: boolean
    monthlyFee?: boolean
    trialEndsAt?: boolean
    nextBillingDate?: boolean
    lastBillingDate?: boolean
    totalBilled?: boolean
    outstandingBalance?: boolean
    contactName?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    slug?: boolean
    companyName?: boolean
    companyDocument?: boolean
    status?: boolean
    databaseHost?: boolean
    databasePort?: boolean
    databaseName?: boolean
    databaseUser?: boolean
    databasePassword?: boolean
    subdomain?: boolean
    customDomain?: boolean
    adminSubdomain?: boolean
    maxUsers?: boolean
    maxAdmins?: boolean
    maxStorageGB?: boolean
    subscriptionPlan?: boolean
    subscriptionStatus?: boolean
    monthlyFee?: boolean
    trialEndsAt?: boolean
    nextBillingDate?: boolean
    lastBillingDate?: boolean
    totalBilled?: boolean
    outstandingBalance?: boolean
    contactName?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "slug" | "companyName" | "companyDocument" | "status" | "databaseHost" | "databasePort" | "databaseName" | "databaseUser" | "databasePassword" | "subdomain" | "customDomain" | "adminSubdomain" | "maxUsers" | "maxAdmins" | "maxStorageGB" | "subscriptionPlan" | "subscriptionStatus" | "monthlyFee" | "trialEndsAt" | "nextBillingDate" | "lastBillingDate" | "totalBilled" | "outstandingBalance" | "contactName" | "contactEmail" | "contactPhone" | "createdAt" | "updatedAt", ExtArgs["result"]["tenant"]>
  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    branding?: boolean | Tenant$brandingArgs<ExtArgs>
    modules?: boolean | Tenant$modulesArgs<ExtArgs>
    admins?: boolean | Tenant$adminsArgs<ExtArgs>
    apiKeys?: boolean | Tenant$apiKeysArgs<ExtArgs>
    usageStats?: boolean | Tenant$usageStatsArgs<ExtArgs>
    stats?: boolean | Tenant$statsArgs<ExtArgs>
    cashbackConfig?: boolean | Tenant$cashbackConfigArgs<ExtArgs>
    withdrawalConfig?: boolean | Tenant$withdrawalConfigArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TenantIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      branding: Prisma.$TenantBrandingPayload<ExtArgs> | null
      modules: Prisma.$TenantModulePayload<ExtArgs>[]
      admins: Prisma.$TenantAdminPayload<ExtArgs>[]
      apiKeys: Prisma.$TenantApiKeyPayload<ExtArgs>[]
      usageStats: Prisma.$TenantUsageStatsPayload<ExtArgs>[]
      stats: Prisma.$TenantStatsPayload<ExtArgs> | null
      cashbackConfig: Prisma.$TenantCashbackConfigPayload<ExtArgs> | null
      withdrawalConfig: Prisma.$TenantWithdrawalConfigPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      slug: string
      companyName: string
      companyDocument: string
      status: $Enums.TenantStatus
      databaseHost: string
      databasePort: number
      databaseName: string
      databaseUser: string
      databasePassword: string
      subdomain: string | null
      customDomain: string | null
      adminSubdomain: string | null
      maxUsers: number
      maxAdmins: number
      maxStorageGB: number
      subscriptionPlan: $Enums.SubscriptionPlan
      subscriptionStatus: $Enums.SubscriptionStatus
      monthlyFee: Prisma.Decimal
      trialEndsAt: Date | null
      nextBillingDate: Date | null
      lastBillingDate: Date | null
      totalBilled: Prisma.Decimal
      outstandingBalance: Prisma.Decimal
      contactName: string
      contactEmail: string
      contactPhone: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants and returns the data updated in the database.
     * @param {TenantUpdateManyAndReturnArgs} args - Arguments to update many Tenants.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    branding<T extends Tenant$brandingArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$brandingArgs<ExtArgs>>): Prisma__TenantBrandingClient<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    modules<T extends Tenant$modulesArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$modulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    admins<T extends Tenant$adminsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$adminsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    apiKeys<T extends Tenant$apiKeysArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$apiKeysArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    usageStats<T extends Tenant$usageStatsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$usageStatsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    stats<T extends Tenant$statsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$statsArgs<ExtArgs>>): Prisma__TenantStatsClient<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    cashbackConfig<T extends Tenant$cashbackConfigArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$cashbackConfigArgs<ExtArgs>>): Prisma__TenantCashbackConfigClient<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    withdrawalConfig<T extends Tenant$withdrawalConfigArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$withdrawalConfigArgs<ExtArgs>>): Prisma__TenantWithdrawalConfigClient<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tenant model
   */
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly slug: FieldRef<"Tenant", 'String'>
    readonly companyName: FieldRef<"Tenant", 'String'>
    readonly companyDocument: FieldRef<"Tenant", 'String'>
    readonly status: FieldRef<"Tenant", 'TenantStatus'>
    readonly databaseHost: FieldRef<"Tenant", 'String'>
    readonly databasePort: FieldRef<"Tenant", 'Int'>
    readonly databaseName: FieldRef<"Tenant", 'String'>
    readonly databaseUser: FieldRef<"Tenant", 'String'>
    readonly databasePassword: FieldRef<"Tenant", 'String'>
    readonly subdomain: FieldRef<"Tenant", 'String'>
    readonly customDomain: FieldRef<"Tenant", 'String'>
    readonly adminSubdomain: FieldRef<"Tenant", 'String'>
    readonly maxUsers: FieldRef<"Tenant", 'Int'>
    readonly maxAdmins: FieldRef<"Tenant", 'Int'>
    readonly maxStorageGB: FieldRef<"Tenant", 'Int'>
    readonly subscriptionPlan: FieldRef<"Tenant", 'SubscriptionPlan'>
    readonly subscriptionStatus: FieldRef<"Tenant", 'SubscriptionStatus'>
    readonly monthlyFee: FieldRef<"Tenant", 'Decimal'>
    readonly trialEndsAt: FieldRef<"Tenant", 'DateTime'>
    readonly nextBillingDate: FieldRef<"Tenant", 'DateTime'>
    readonly lastBillingDate: FieldRef<"Tenant", 'DateTime'>
    readonly totalBilled: FieldRef<"Tenant", 'Decimal'>
    readonly outstandingBalance: FieldRef<"Tenant", 'Decimal'>
    readonly contactName: FieldRef<"Tenant", 'String'>
    readonly contactEmail: FieldRef<"Tenant", 'String'>
    readonly contactPhone: FieldRef<"Tenant", 'String'>
    readonly createdAt: FieldRef<"Tenant", 'DateTime'>
    readonly updatedAt: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant updateManyAndReturn
   */
  export type TenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to delete.
     */
    limit?: number
  }

  /**
   * Tenant.branding
   */
  export type Tenant$brandingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingInclude<ExtArgs> | null
    where?: TenantBrandingWhereInput
  }

  /**
   * Tenant.modules
   */
  export type Tenant$modulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    where?: TenantModuleWhereInput
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    cursor?: TenantModuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * Tenant.admins
   */
  export type Tenant$adminsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminInclude<ExtArgs> | null
    where?: TenantAdminWhereInput
    orderBy?: TenantAdminOrderByWithRelationInput | TenantAdminOrderByWithRelationInput[]
    cursor?: TenantAdminWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantAdminScalarFieldEnum | TenantAdminScalarFieldEnum[]
  }

  /**
   * Tenant.apiKeys
   */
  export type Tenant$apiKeysArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyInclude<ExtArgs> | null
    where?: TenantApiKeyWhereInput
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    cursor?: TenantApiKeyWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantApiKeyScalarFieldEnum | TenantApiKeyScalarFieldEnum[]
  }

  /**
   * Tenant.usageStats
   */
  export type Tenant$usageStatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsInclude<ExtArgs> | null
    where?: TenantUsageStatsWhereInput
    orderBy?: TenantUsageStatsOrderByWithRelationInput | TenantUsageStatsOrderByWithRelationInput[]
    cursor?: TenantUsageStatsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantUsageStatsScalarFieldEnum | TenantUsageStatsScalarFieldEnum[]
  }

  /**
   * Tenant.stats
   */
  export type Tenant$statsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsInclude<ExtArgs> | null
    where?: TenantStatsWhereInput
  }

  /**
   * Tenant.cashbackConfig
   */
  export type Tenant$cashbackConfigArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigInclude<ExtArgs> | null
    where?: TenantCashbackConfigWhereInput
  }

  /**
   * Tenant.withdrawalConfig
   */
  export type Tenant$withdrawalConfigArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigInclude<ExtArgs> | null
    where?: TenantWithdrawalConfigWhereInput
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
  }


  /**
   * Model TenantBranding
   */

  export type AggregateTenantBranding = {
    _count: TenantBrandingCountAggregateOutputType | null
    _min: TenantBrandingMinAggregateOutputType | null
    _max: TenantBrandingMaxAggregateOutputType | null
  }

  export type TenantBrandingMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    logoUrl: string | null
    logoIconUrl: string | null
    faviconUrl: string | null
    primaryColor: string | null
    secondaryColor: string | null
    accentColor: string | null
    backgroundColor: string | null
    textColor: string | null
    appName: string | null
    appDescription: string | null
    appStoreUrl: string | null
    playStoreUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantBrandingMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    logoUrl: string | null
    logoIconUrl: string | null
    faviconUrl: string | null
    primaryColor: string | null
    secondaryColor: string | null
    accentColor: string | null
    backgroundColor: string | null
    textColor: string | null
    appName: string | null
    appDescription: string | null
    appStoreUrl: string | null
    playStoreUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantBrandingCountAggregateOutputType = {
    id: number
    tenantId: number
    logoUrl: number
    logoIconUrl: number
    faviconUrl: number
    primaryColor: number
    secondaryColor: number
    accentColor: number
    backgroundColor: number
    textColor: number
    appName: number
    appDescription: number
    appStoreUrl: number
    playStoreUrl: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantBrandingMinAggregateInputType = {
    id?: true
    tenantId?: true
    logoUrl?: true
    logoIconUrl?: true
    faviconUrl?: true
    primaryColor?: true
    secondaryColor?: true
    accentColor?: true
    backgroundColor?: true
    textColor?: true
    appName?: true
    appDescription?: true
    appStoreUrl?: true
    playStoreUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantBrandingMaxAggregateInputType = {
    id?: true
    tenantId?: true
    logoUrl?: true
    logoIconUrl?: true
    faviconUrl?: true
    primaryColor?: true
    secondaryColor?: true
    accentColor?: true
    backgroundColor?: true
    textColor?: true
    appName?: true
    appDescription?: true
    appStoreUrl?: true
    playStoreUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantBrandingCountAggregateInputType = {
    id?: true
    tenantId?: true
    logoUrl?: true
    logoIconUrl?: true
    faviconUrl?: true
    primaryColor?: true
    secondaryColor?: true
    accentColor?: true
    backgroundColor?: true
    textColor?: true
    appName?: true
    appDescription?: true
    appStoreUrl?: true
    playStoreUrl?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantBrandingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantBranding to aggregate.
     */
    where?: TenantBrandingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantBrandings to fetch.
     */
    orderBy?: TenantBrandingOrderByWithRelationInput | TenantBrandingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantBrandingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantBrandings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantBrandings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantBrandings
    **/
    _count?: true | TenantBrandingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantBrandingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantBrandingMaxAggregateInputType
  }

  export type GetTenantBrandingAggregateType<T extends TenantBrandingAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantBranding]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantBranding[P]>
      : GetScalarType<T[P], AggregateTenantBranding[P]>
  }




  export type TenantBrandingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantBrandingWhereInput
    orderBy?: TenantBrandingOrderByWithAggregationInput | TenantBrandingOrderByWithAggregationInput[]
    by: TenantBrandingScalarFieldEnum[] | TenantBrandingScalarFieldEnum
    having?: TenantBrandingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantBrandingCountAggregateInputType | true
    _min?: TenantBrandingMinAggregateInputType
    _max?: TenantBrandingMaxAggregateInputType
  }

  export type TenantBrandingGroupByOutputType = {
    id: string
    tenantId: string
    logoUrl: string | null
    logoIconUrl: string | null
    faviconUrl: string | null
    primaryColor: string
    secondaryColor: string
    accentColor: string
    backgroundColor: string
    textColor: string
    appName: string
    appDescription: string | null
    appStoreUrl: string | null
    playStoreUrl: string | null
    createdAt: Date
    updatedAt: Date
    _count: TenantBrandingCountAggregateOutputType | null
    _min: TenantBrandingMinAggregateOutputType | null
    _max: TenantBrandingMaxAggregateOutputType | null
  }

  type GetTenantBrandingGroupByPayload<T extends TenantBrandingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantBrandingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantBrandingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantBrandingGroupByOutputType[P]>
            : GetScalarType<T[P], TenantBrandingGroupByOutputType[P]>
        }
      >
    >


  export type TenantBrandingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    logoUrl?: boolean
    logoIconUrl?: boolean
    faviconUrl?: boolean
    primaryColor?: boolean
    secondaryColor?: boolean
    accentColor?: boolean
    backgroundColor?: boolean
    textColor?: boolean
    appName?: boolean
    appDescription?: boolean
    appStoreUrl?: boolean
    playStoreUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantBranding"]>

  export type TenantBrandingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    logoUrl?: boolean
    logoIconUrl?: boolean
    faviconUrl?: boolean
    primaryColor?: boolean
    secondaryColor?: boolean
    accentColor?: boolean
    backgroundColor?: boolean
    textColor?: boolean
    appName?: boolean
    appDescription?: boolean
    appStoreUrl?: boolean
    playStoreUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantBranding"]>

  export type TenantBrandingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    logoUrl?: boolean
    logoIconUrl?: boolean
    faviconUrl?: boolean
    primaryColor?: boolean
    secondaryColor?: boolean
    accentColor?: boolean
    backgroundColor?: boolean
    textColor?: boolean
    appName?: boolean
    appDescription?: boolean
    appStoreUrl?: boolean
    playStoreUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantBranding"]>

  export type TenantBrandingSelectScalar = {
    id?: boolean
    tenantId?: boolean
    logoUrl?: boolean
    logoIconUrl?: boolean
    faviconUrl?: boolean
    primaryColor?: boolean
    secondaryColor?: boolean
    accentColor?: boolean
    backgroundColor?: boolean
    textColor?: boolean
    appName?: boolean
    appDescription?: boolean
    appStoreUrl?: boolean
    playStoreUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantBrandingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "logoUrl" | "logoIconUrl" | "faviconUrl" | "primaryColor" | "secondaryColor" | "accentColor" | "backgroundColor" | "textColor" | "appName" | "appDescription" | "appStoreUrl" | "playStoreUrl" | "createdAt" | "updatedAt", ExtArgs["result"]["tenantBranding"]>
  export type TenantBrandingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantBrandingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantBrandingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $TenantBrandingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantBranding"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      logoUrl: string | null
      logoIconUrl: string | null
      faviconUrl: string | null
      primaryColor: string
      secondaryColor: string
      accentColor: string
      backgroundColor: string
      textColor: string
      appName: string
      appDescription: string | null
      appStoreUrl: string | null
      playStoreUrl: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantBranding"]>
    composites: {}
  }

  type TenantBrandingGetPayload<S extends boolean | null | undefined | TenantBrandingDefaultArgs> = $Result.GetResult<Prisma.$TenantBrandingPayload, S>

  type TenantBrandingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantBrandingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantBrandingCountAggregateInputType | true
    }

  export interface TenantBrandingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantBranding'], meta: { name: 'TenantBranding' } }
    /**
     * Find zero or one TenantBranding that matches the filter.
     * @param {TenantBrandingFindUniqueArgs} args - Arguments to find a TenantBranding
     * @example
     * // Get one TenantBranding
     * const tenantBranding = await prisma.tenantBranding.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantBrandingFindUniqueArgs>(args: SelectSubset<T, TenantBrandingFindUniqueArgs<ExtArgs>>): Prisma__TenantBrandingClient<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantBranding that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantBrandingFindUniqueOrThrowArgs} args - Arguments to find a TenantBranding
     * @example
     * // Get one TenantBranding
     * const tenantBranding = await prisma.tenantBranding.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantBrandingFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantBrandingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantBrandingClient<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantBranding that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantBrandingFindFirstArgs} args - Arguments to find a TenantBranding
     * @example
     * // Get one TenantBranding
     * const tenantBranding = await prisma.tenantBranding.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantBrandingFindFirstArgs>(args?: SelectSubset<T, TenantBrandingFindFirstArgs<ExtArgs>>): Prisma__TenantBrandingClient<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantBranding that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantBrandingFindFirstOrThrowArgs} args - Arguments to find a TenantBranding
     * @example
     * // Get one TenantBranding
     * const tenantBranding = await prisma.tenantBranding.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantBrandingFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantBrandingFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantBrandingClient<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantBrandings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantBrandingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantBrandings
     * const tenantBrandings = await prisma.tenantBranding.findMany()
     * 
     * // Get first 10 TenantBrandings
     * const tenantBrandings = await prisma.tenantBranding.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantBrandingWithIdOnly = await prisma.tenantBranding.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantBrandingFindManyArgs>(args?: SelectSubset<T, TenantBrandingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantBranding.
     * @param {TenantBrandingCreateArgs} args - Arguments to create a TenantBranding.
     * @example
     * // Create one TenantBranding
     * const TenantBranding = await prisma.tenantBranding.create({
     *   data: {
     *     // ... data to create a TenantBranding
     *   }
     * })
     * 
     */
    create<T extends TenantBrandingCreateArgs>(args: SelectSubset<T, TenantBrandingCreateArgs<ExtArgs>>): Prisma__TenantBrandingClient<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantBrandings.
     * @param {TenantBrandingCreateManyArgs} args - Arguments to create many TenantBrandings.
     * @example
     * // Create many TenantBrandings
     * const tenantBranding = await prisma.tenantBranding.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantBrandingCreateManyArgs>(args?: SelectSubset<T, TenantBrandingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantBrandings and returns the data saved in the database.
     * @param {TenantBrandingCreateManyAndReturnArgs} args - Arguments to create many TenantBrandings.
     * @example
     * // Create many TenantBrandings
     * const tenantBranding = await prisma.tenantBranding.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantBrandings and only return the `id`
     * const tenantBrandingWithIdOnly = await prisma.tenantBranding.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantBrandingCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantBrandingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantBranding.
     * @param {TenantBrandingDeleteArgs} args - Arguments to delete one TenantBranding.
     * @example
     * // Delete one TenantBranding
     * const TenantBranding = await prisma.tenantBranding.delete({
     *   where: {
     *     // ... filter to delete one TenantBranding
     *   }
     * })
     * 
     */
    delete<T extends TenantBrandingDeleteArgs>(args: SelectSubset<T, TenantBrandingDeleteArgs<ExtArgs>>): Prisma__TenantBrandingClient<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantBranding.
     * @param {TenantBrandingUpdateArgs} args - Arguments to update one TenantBranding.
     * @example
     * // Update one TenantBranding
     * const tenantBranding = await prisma.tenantBranding.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantBrandingUpdateArgs>(args: SelectSubset<T, TenantBrandingUpdateArgs<ExtArgs>>): Prisma__TenantBrandingClient<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantBrandings.
     * @param {TenantBrandingDeleteManyArgs} args - Arguments to filter TenantBrandings to delete.
     * @example
     * // Delete a few TenantBrandings
     * const { count } = await prisma.tenantBranding.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantBrandingDeleteManyArgs>(args?: SelectSubset<T, TenantBrandingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantBrandings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantBrandingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantBrandings
     * const tenantBranding = await prisma.tenantBranding.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantBrandingUpdateManyArgs>(args: SelectSubset<T, TenantBrandingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantBrandings and returns the data updated in the database.
     * @param {TenantBrandingUpdateManyAndReturnArgs} args - Arguments to update many TenantBrandings.
     * @example
     * // Update many TenantBrandings
     * const tenantBranding = await prisma.tenantBranding.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantBrandings and only return the `id`
     * const tenantBrandingWithIdOnly = await prisma.tenantBranding.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantBrandingUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantBrandingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantBranding.
     * @param {TenantBrandingUpsertArgs} args - Arguments to update or create a TenantBranding.
     * @example
     * // Update or create a TenantBranding
     * const tenantBranding = await prisma.tenantBranding.upsert({
     *   create: {
     *     // ... data to create a TenantBranding
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantBranding we want to update
     *   }
     * })
     */
    upsert<T extends TenantBrandingUpsertArgs>(args: SelectSubset<T, TenantBrandingUpsertArgs<ExtArgs>>): Prisma__TenantBrandingClient<$Result.GetResult<Prisma.$TenantBrandingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantBrandings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantBrandingCountArgs} args - Arguments to filter TenantBrandings to count.
     * @example
     * // Count the number of TenantBrandings
     * const count = await prisma.tenantBranding.count({
     *   where: {
     *     // ... the filter for the TenantBrandings we want to count
     *   }
     * })
    **/
    count<T extends TenantBrandingCountArgs>(
      args?: Subset<T, TenantBrandingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantBrandingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantBranding.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantBrandingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantBrandingAggregateArgs>(args: Subset<T, TenantBrandingAggregateArgs>): Prisma.PrismaPromise<GetTenantBrandingAggregateType<T>>

    /**
     * Group by TenantBranding.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantBrandingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantBrandingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantBrandingGroupByArgs['orderBy'] }
        : { orderBy?: TenantBrandingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantBrandingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantBrandingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantBranding model
   */
  readonly fields: TenantBrandingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantBranding.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantBrandingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantBranding model
   */
  interface TenantBrandingFieldRefs {
    readonly id: FieldRef<"TenantBranding", 'String'>
    readonly tenantId: FieldRef<"TenantBranding", 'String'>
    readonly logoUrl: FieldRef<"TenantBranding", 'String'>
    readonly logoIconUrl: FieldRef<"TenantBranding", 'String'>
    readonly faviconUrl: FieldRef<"TenantBranding", 'String'>
    readonly primaryColor: FieldRef<"TenantBranding", 'String'>
    readonly secondaryColor: FieldRef<"TenantBranding", 'String'>
    readonly accentColor: FieldRef<"TenantBranding", 'String'>
    readonly backgroundColor: FieldRef<"TenantBranding", 'String'>
    readonly textColor: FieldRef<"TenantBranding", 'String'>
    readonly appName: FieldRef<"TenantBranding", 'String'>
    readonly appDescription: FieldRef<"TenantBranding", 'String'>
    readonly appStoreUrl: FieldRef<"TenantBranding", 'String'>
    readonly playStoreUrl: FieldRef<"TenantBranding", 'String'>
    readonly createdAt: FieldRef<"TenantBranding", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantBranding", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantBranding findUnique
   */
  export type TenantBrandingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingInclude<ExtArgs> | null
    /**
     * Filter, which TenantBranding to fetch.
     */
    where: TenantBrandingWhereUniqueInput
  }

  /**
   * TenantBranding findUniqueOrThrow
   */
  export type TenantBrandingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingInclude<ExtArgs> | null
    /**
     * Filter, which TenantBranding to fetch.
     */
    where: TenantBrandingWhereUniqueInput
  }

  /**
   * TenantBranding findFirst
   */
  export type TenantBrandingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingInclude<ExtArgs> | null
    /**
     * Filter, which TenantBranding to fetch.
     */
    where?: TenantBrandingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantBrandings to fetch.
     */
    orderBy?: TenantBrandingOrderByWithRelationInput | TenantBrandingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantBrandings.
     */
    cursor?: TenantBrandingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantBrandings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantBrandings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantBrandings.
     */
    distinct?: TenantBrandingScalarFieldEnum | TenantBrandingScalarFieldEnum[]
  }

  /**
   * TenantBranding findFirstOrThrow
   */
  export type TenantBrandingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingInclude<ExtArgs> | null
    /**
     * Filter, which TenantBranding to fetch.
     */
    where?: TenantBrandingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantBrandings to fetch.
     */
    orderBy?: TenantBrandingOrderByWithRelationInput | TenantBrandingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantBrandings.
     */
    cursor?: TenantBrandingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantBrandings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantBrandings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantBrandings.
     */
    distinct?: TenantBrandingScalarFieldEnum | TenantBrandingScalarFieldEnum[]
  }

  /**
   * TenantBranding findMany
   */
  export type TenantBrandingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingInclude<ExtArgs> | null
    /**
     * Filter, which TenantBrandings to fetch.
     */
    where?: TenantBrandingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantBrandings to fetch.
     */
    orderBy?: TenantBrandingOrderByWithRelationInput | TenantBrandingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantBrandings.
     */
    cursor?: TenantBrandingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantBrandings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantBrandings.
     */
    skip?: number
    distinct?: TenantBrandingScalarFieldEnum | TenantBrandingScalarFieldEnum[]
  }

  /**
   * TenantBranding create
   */
  export type TenantBrandingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantBranding.
     */
    data: XOR<TenantBrandingCreateInput, TenantBrandingUncheckedCreateInput>
  }

  /**
   * TenantBranding createMany
   */
  export type TenantBrandingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantBrandings.
     */
    data: TenantBrandingCreateManyInput | TenantBrandingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantBranding createManyAndReturn
   */
  export type TenantBrandingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * The data used to create many TenantBrandings.
     */
    data: TenantBrandingCreateManyInput | TenantBrandingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantBranding update
   */
  export type TenantBrandingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantBranding.
     */
    data: XOR<TenantBrandingUpdateInput, TenantBrandingUncheckedUpdateInput>
    /**
     * Choose, which TenantBranding to update.
     */
    where: TenantBrandingWhereUniqueInput
  }

  /**
   * TenantBranding updateMany
   */
  export type TenantBrandingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantBrandings.
     */
    data: XOR<TenantBrandingUpdateManyMutationInput, TenantBrandingUncheckedUpdateManyInput>
    /**
     * Filter which TenantBrandings to update
     */
    where?: TenantBrandingWhereInput
    /**
     * Limit how many TenantBrandings to update.
     */
    limit?: number
  }

  /**
   * TenantBranding updateManyAndReturn
   */
  export type TenantBrandingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * The data used to update TenantBrandings.
     */
    data: XOR<TenantBrandingUpdateManyMutationInput, TenantBrandingUncheckedUpdateManyInput>
    /**
     * Filter which TenantBrandings to update
     */
    where?: TenantBrandingWhereInput
    /**
     * Limit how many TenantBrandings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantBranding upsert
   */
  export type TenantBrandingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantBranding to update in case it exists.
     */
    where: TenantBrandingWhereUniqueInput
    /**
     * In case the TenantBranding found by the `where` argument doesn't exist, create a new TenantBranding with this data.
     */
    create: XOR<TenantBrandingCreateInput, TenantBrandingUncheckedCreateInput>
    /**
     * In case the TenantBranding was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantBrandingUpdateInput, TenantBrandingUncheckedUpdateInput>
  }

  /**
   * TenantBranding delete
   */
  export type TenantBrandingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingInclude<ExtArgs> | null
    /**
     * Filter which TenantBranding to delete.
     */
    where: TenantBrandingWhereUniqueInput
  }

  /**
   * TenantBranding deleteMany
   */
  export type TenantBrandingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantBrandings to delete
     */
    where?: TenantBrandingWhereInput
    /**
     * Limit how many TenantBrandings to delete.
     */
    limit?: number
  }

  /**
   * TenantBranding without action
   */
  export type TenantBrandingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantBranding
     */
    select?: TenantBrandingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantBranding
     */
    omit?: TenantBrandingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantBrandingInclude<ExtArgs> | null
  }


  /**
   * Model TenantModule
   */

  export type AggregateTenantModule = {
    _count: TenantModuleCountAggregateOutputType | null
    _avg: TenantModuleAvgAggregateOutputType | null
    _sum: TenantModuleSumAggregateOutputType | null
    _min: TenantModuleMinAggregateOutputType | null
    _max: TenantModuleMaxAggregateOutputType | null
  }

  export type TenantModuleAvgAggregateOutputType = {
    sortOrder: number | null
  }

  export type TenantModuleSumAggregateOutputType = {
    sortOrder: number | null
  }

  export type TenantModuleMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    moduleKey: $Enums.ModuleKey | null
    isEnabled: boolean | null
    isEnabledByDefault: boolean | null
    displayName: string | null
    description: string | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantModuleMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    moduleKey: $Enums.ModuleKey | null
    isEnabled: boolean | null
    isEnabledByDefault: boolean | null
    displayName: string | null
    description: string | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantModuleCountAggregateOutputType = {
    id: number
    tenantId: number
    moduleKey: number
    isEnabled: number
    isEnabledByDefault: number
    config: number
    displayName: number
    description: number
    sortOrder: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantModuleAvgAggregateInputType = {
    sortOrder?: true
  }

  export type TenantModuleSumAggregateInputType = {
    sortOrder?: true
  }

  export type TenantModuleMinAggregateInputType = {
    id?: true
    tenantId?: true
    moduleKey?: true
    isEnabled?: true
    isEnabledByDefault?: true
    displayName?: true
    description?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantModuleMaxAggregateInputType = {
    id?: true
    tenantId?: true
    moduleKey?: true
    isEnabled?: true
    isEnabledByDefault?: true
    displayName?: true
    description?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantModuleCountAggregateInputType = {
    id?: true
    tenantId?: true
    moduleKey?: true
    isEnabled?: true
    isEnabledByDefault?: true
    config?: true
    displayName?: true
    description?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantModuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantModule to aggregate.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantModules
    **/
    _count?: true | TenantModuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TenantModuleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TenantModuleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantModuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantModuleMaxAggregateInputType
  }

  export type GetTenantModuleAggregateType<T extends TenantModuleAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantModule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantModule[P]>
      : GetScalarType<T[P], AggregateTenantModule[P]>
  }




  export type TenantModuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantModuleWhereInput
    orderBy?: TenantModuleOrderByWithAggregationInput | TenantModuleOrderByWithAggregationInput[]
    by: TenantModuleScalarFieldEnum[] | TenantModuleScalarFieldEnum
    having?: TenantModuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantModuleCountAggregateInputType | true
    _avg?: TenantModuleAvgAggregateInputType
    _sum?: TenantModuleSumAggregateInputType
    _min?: TenantModuleMinAggregateInputType
    _max?: TenantModuleMaxAggregateInputType
  }

  export type TenantModuleGroupByOutputType = {
    id: string
    tenantId: string
    moduleKey: $Enums.ModuleKey
    isEnabled: boolean
    isEnabledByDefault: boolean
    config: JsonValue | null
    displayName: string
    description: string | null
    sortOrder: number
    createdAt: Date
    updatedAt: Date
    _count: TenantModuleCountAggregateOutputType | null
    _avg: TenantModuleAvgAggregateOutputType | null
    _sum: TenantModuleSumAggregateOutputType | null
    _min: TenantModuleMinAggregateOutputType | null
    _max: TenantModuleMaxAggregateOutputType | null
  }

  type GetTenantModuleGroupByPayload<T extends TenantModuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantModuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantModuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantModuleGroupByOutputType[P]>
            : GetScalarType<T[P], TenantModuleGroupByOutputType[P]>
        }
      >
    >


  export type TenantModuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    moduleKey?: boolean
    isEnabled?: boolean
    isEnabledByDefault?: boolean
    config?: boolean
    displayName?: boolean
    description?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantModule"]>

  export type TenantModuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    moduleKey?: boolean
    isEnabled?: boolean
    isEnabledByDefault?: boolean
    config?: boolean
    displayName?: boolean
    description?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantModule"]>

  export type TenantModuleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    moduleKey?: boolean
    isEnabled?: boolean
    isEnabledByDefault?: boolean
    config?: boolean
    displayName?: boolean
    description?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantModule"]>

  export type TenantModuleSelectScalar = {
    id?: boolean
    tenantId?: boolean
    moduleKey?: boolean
    isEnabled?: boolean
    isEnabledByDefault?: boolean
    config?: boolean
    displayName?: boolean
    description?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantModuleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "moduleKey" | "isEnabled" | "isEnabledByDefault" | "config" | "displayName" | "description" | "sortOrder" | "createdAt" | "updatedAt", ExtArgs["result"]["tenantModule"]>
  export type TenantModuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantModuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantModuleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $TenantModulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantModule"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      moduleKey: $Enums.ModuleKey
      isEnabled: boolean
      isEnabledByDefault: boolean
      config: Prisma.JsonValue | null
      displayName: string
      description: string | null
      sortOrder: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantModule"]>
    composites: {}
  }

  type TenantModuleGetPayload<S extends boolean | null | undefined | TenantModuleDefaultArgs> = $Result.GetResult<Prisma.$TenantModulePayload, S>

  type TenantModuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantModuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantModuleCountAggregateInputType | true
    }

  export interface TenantModuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantModule'], meta: { name: 'TenantModule' } }
    /**
     * Find zero or one TenantModule that matches the filter.
     * @param {TenantModuleFindUniqueArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantModuleFindUniqueArgs>(args: SelectSubset<T, TenantModuleFindUniqueArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantModule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantModuleFindUniqueOrThrowArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantModuleFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantModuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantModule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleFindFirstArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantModuleFindFirstArgs>(args?: SelectSubset<T, TenantModuleFindFirstArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantModule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleFindFirstOrThrowArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantModuleFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantModuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantModules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantModules
     * const tenantModules = await prisma.tenantModule.findMany()
     * 
     * // Get first 10 TenantModules
     * const tenantModules = await prisma.tenantModule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantModuleWithIdOnly = await prisma.tenantModule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantModuleFindManyArgs>(args?: SelectSubset<T, TenantModuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantModule.
     * @param {TenantModuleCreateArgs} args - Arguments to create a TenantModule.
     * @example
     * // Create one TenantModule
     * const TenantModule = await prisma.tenantModule.create({
     *   data: {
     *     // ... data to create a TenantModule
     *   }
     * })
     * 
     */
    create<T extends TenantModuleCreateArgs>(args: SelectSubset<T, TenantModuleCreateArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantModules.
     * @param {TenantModuleCreateManyArgs} args - Arguments to create many TenantModules.
     * @example
     * // Create many TenantModules
     * const tenantModule = await prisma.tenantModule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantModuleCreateManyArgs>(args?: SelectSubset<T, TenantModuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantModules and returns the data saved in the database.
     * @param {TenantModuleCreateManyAndReturnArgs} args - Arguments to create many TenantModules.
     * @example
     * // Create many TenantModules
     * const tenantModule = await prisma.tenantModule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantModules and only return the `id`
     * const tenantModuleWithIdOnly = await prisma.tenantModule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantModuleCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantModuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantModule.
     * @param {TenantModuleDeleteArgs} args - Arguments to delete one TenantModule.
     * @example
     * // Delete one TenantModule
     * const TenantModule = await prisma.tenantModule.delete({
     *   where: {
     *     // ... filter to delete one TenantModule
     *   }
     * })
     * 
     */
    delete<T extends TenantModuleDeleteArgs>(args: SelectSubset<T, TenantModuleDeleteArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantModule.
     * @param {TenantModuleUpdateArgs} args - Arguments to update one TenantModule.
     * @example
     * // Update one TenantModule
     * const tenantModule = await prisma.tenantModule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantModuleUpdateArgs>(args: SelectSubset<T, TenantModuleUpdateArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantModules.
     * @param {TenantModuleDeleteManyArgs} args - Arguments to filter TenantModules to delete.
     * @example
     * // Delete a few TenantModules
     * const { count } = await prisma.tenantModule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantModuleDeleteManyArgs>(args?: SelectSubset<T, TenantModuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantModules
     * const tenantModule = await prisma.tenantModule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantModuleUpdateManyArgs>(args: SelectSubset<T, TenantModuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantModules and returns the data updated in the database.
     * @param {TenantModuleUpdateManyAndReturnArgs} args - Arguments to update many TenantModules.
     * @example
     * // Update many TenantModules
     * const tenantModule = await prisma.tenantModule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantModules and only return the `id`
     * const tenantModuleWithIdOnly = await prisma.tenantModule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantModuleUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantModuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantModule.
     * @param {TenantModuleUpsertArgs} args - Arguments to update or create a TenantModule.
     * @example
     * // Update or create a TenantModule
     * const tenantModule = await prisma.tenantModule.upsert({
     *   create: {
     *     // ... data to create a TenantModule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantModule we want to update
     *   }
     * })
     */
    upsert<T extends TenantModuleUpsertArgs>(args: SelectSubset<T, TenantModuleUpsertArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleCountArgs} args - Arguments to filter TenantModules to count.
     * @example
     * // Count the number of TenantModules
     * const count = await prisma.tenantModule.count({
     *   where: {
     *     // ... the filter for the TenantModules we want to count
     *   }
     * })
    **/
    count<T extends TenantModuleCountArgs>(
      args?: Subset<T, TenantModuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantModuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantModuleAggregateArgs>(args: Subset<T, TenantModuleAggregateArgs>): Prisma.PrismaPromise<GetTenantModuleAggregateType<T>>

    /**
     * Group by TenantModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantModuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantModuleGroupByArgs['orderBy'] }
        : { orderBy?: TenantModuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantModuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantModuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantModule model
   */
  readonly fields: TenantModuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantModule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantModuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantModule model
   */
  interface TenantModuleFieldRefs {
    readonly id: FieldRef<"TenantModule", 'String'>
    readonly tenantId: FieldRef<"TenantModule", 'String'>
    readonly moduleKey: FieldRef<"TenantModule", 'ModuleKey'>
    readonly isEnabled: FieldRef<"TenantModule", 'Boolean'>
    readonly isEnabledByDefault: FieldRef<"TenantModule", 'Boolean'>
    readonly config: FieldRef<"TenantModule", 'Json'>
    readonly displayName: FieldRef<"TenantModule", 'String'>
    readonly description: FieldRef<"TenantModule", 'String'>
    readonly sortOrder: FieldRef<"TenantModule", 'Int'>
    readonly createdAt: FieldRef<"TenantModule", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantModule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantModule findUnique
   */
  export type TenantModuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule findUniqueOrThrow
   */
  export type TenantModuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule findFirst
   */
  export type TenantModuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantModules.
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantModules.
     */
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * TenantModule findFirstOrThrow
   */
  export type TenantModuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantModules.
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantModules.
     */
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * TenantModule findMany
   */
  export type TenantModuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter, which TenantModules to fetch.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantModules.
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * TenantModule create
   */
  export type TenantModuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantModule.
     */
    data: XOR<TenantModuleCreateInput, TenantModuleUncheckedCreateInput>
  }

  /**
   * TenantModule createMany
   */
  export type TenantModuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantModules.
     */
    data: TenantModuleCreateManyInput | TenantModuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantModule createManyAndReturn
   */
  export type TenantModuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * The data used to create many TenantModules.
     */
    data: TenantModuleCreateManyInput | TenantModuleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantModule update
   */
  export type TenantModuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantModule.
     */
    data: XOR<TenantModuleUpdateInput, TenantModuleUncheckedUpdateInput>
    /**
     * Choose, which TenantModule to update.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule updateMany
   */
  export type TenantModuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantModules.
     */
    data: XOR<TenantModuleUpdateManyMutationInput, TenantModuleUncheckedUpdateManyInput>
    /**
     * Filter which TenantModules to update
     */
    where?: TenantModuleWhereInput
    /**
     * Limit how many TenantModules to update.
     */
    limit?: number
  }

  /**
   * TenantModule updateManyAndReturn
   */
  export type TenantModuleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * The data used to update TenantModules.
     */
    data: XOR<TenantModuleUpdateManyMutationInput, TenantModuleUncheckedUpdateManyInput>
    /**
     * Filter which TenantModules to update
     */
    where?: TenantModuleWhereInput
    /**
     * Limit how many TenantModules to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantModule upsert
   */
  export type TenantModuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantModule to update in case it exists.
     */
    where: TenantModuleWhereUniqueInput
    /**
     * In case the TenantModule found by the `where` argument doesn't exist, create a new TenantModule with this data.
     */
    create: XOR<TenantModuleCreateInput, TenantModuleUncheckedCreateInput>
    /**
     * In case the TenantModule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantModuleUpdateInput, TenantModuleUncheckedUpdateInput>
  }

  /**
   * TenantModule delete
   */
  export type TenantModuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter which TenantModule to delete.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule deleteMany
   */
  export type TenantModuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantModules to delete
     */
    where?: TenantModuleWhereInput
    /**
     * Limit how many TenantModules to delete.
     */
    limit?: number
  }

  /**
   * TenantModule without action
   */
  export type TenantModuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
  }


  /**
   * Model TenantStats
   */

  export type AggregateTenantStats = {
    _count: TenantStatsCountAggregateOutputType | null
    _avg: TenantStatsAvgAggregateOutputType | null
    _sum: TenantStatsSumAggregateOutputType | null
    _min: TenantStatsMinAggregateOutputType | null
    _max: TenantStatsMaxAggregateOutputType | null
  }

  export type TenantStatsAvgAggregateOutputType = {
    totalUsers: number | null
    totalConsumers: number | null
    totalMerchants: number | null
    activeUsers30d: number | null
    totalPurchases: number | null
    totalRevenue: Decimal | null
    totalCashbackPaid: Decimal | null
    totalPlatformFees: Decimal | null
    totalProducts: number | null
    revenue30d: Decimal | null
    purchases30d: number | null
    cashback30d: Decimal | null
  }

  export type TenantStatsSumAggregateOutputType = {
    totalUsers: number | null
    totalConsumers: number | null
    totalMerchants: number | null
    activeUsers30d: number | null
    totalPurchases: number | null
    totalRevenue: Decimal | null
    totalCashbackPaid: Decimal | null
    totalPlatformFees: Decimal | null
    totalProducts: number | null
    revenue30d: Decimal | null
    purchases30d: number | null
    cashback30d: Decimal | null
  }

  export type TenantStatsMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    totalUsers: number | null
    totalConsumers: number | null
    totalMerchants: number | null
    activeUsers30d: number | null
    totalPurchases: number | null
    totalRevenue: Decimal | null
    totalCashbackPaid: Decimal | null
    totalPlatformFees: Decimal | null
    totalProducts: number | null
    revenue30d: Decimal | null
    purchases30d: number | null
    cashback30d: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantStatsMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    totalUsers: number | null
    totalConsumers: number | null
    totalMerchants: number | null
    activeUsers30d: number | null
    totalPurchases: number | null
    totalRevenue: Decimal | null
    totalCashbackPaid: Decimal | null
    totalPlatformFees: Decimal | null
    totalProducts: number | null
    revenue30d: Decimal | null
    purchases30d: number | null
    cashback30d: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantStatsCountAggregateOutputType = {
    id: number
    tenantId: number
    totalUsers: number
    totalConsumers: number
    totalMerchants: number
    activeUsers30d: number
    totalPurchases: number
    totalRevenue: number
    totalCashbackPaid: number
    totalPlatformFees: number
    totalProducts: number
    revenue30d: number
    purchases30d: number
    cashback30d: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantStatsAvgAggregateInputType = {
    totalUsers?: true
    totalConsumers?: true
    totalMerchants?: true
    activeUsers30d?: true
    totalPurchases?: true
    totalRevenue?: true
    totalCashbackPaid?: true
    totalPlatformFees?: true
    totalProducts?: true
    revenue30d?: true
    purchases30d?: true
    cashback30d?: true
  }

  export type TenantStatsSumAggregateInputType = {
    totalUsers?: true
    totalConsumers?: true
    totalMerchants?: true
    activeUsers30d?: true
    totalPurchases?: true
    totalRevenue?: true
    totalCashbackPaid?: true
    totalPlatformFees?: true
    totalProducts?: true
    revenue30d?: true
    purchases30d?: true
    cashback30d?: true
  }

  export type TenantStatsMinAggregateInputType = {
    id?: true
    tenantId?: true
    totalUsers?: true
    totalConsumers?: true
    totalMerchants?: true
    activeUsers30d?: true
    totalPurchases?: true
    totalRevenue?: true
    totalCashbackPaid?: true
    totalPlatformFees?: true
    totalProducts?: true
    revenue30d?: true
    purchases30d?: true
    cashback30d?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantStatsMaxAggregateInputType = {
    id?: true
    tenantId?: true
    totalUsers?: true
    totalConsumers?: true
    totalMerchants?: true
    activeUsers30d?: true
    totalPurchases?: true
    totalRevenue?: true
    totalCashbackPaid?: true
    totalPlatformFees?: true
    totalProducts?: true
    revenue30d?: true
    purchases30d?: true
    cashback30d?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantStatsCountAggregateInputType = {
    id?: true
    tenantId?: true
    totalUsers?: true
    totalConsumers?: true
    totalMerchants?: true
    activeUsers30d?: true
    totalPurchases?: true
    totalRevenue?: true
    totalCashbackPaid?: true
    totalPlatformFees?: true
    totalProducts?: true
    revenue30d?: true
    purchases30d?: true
    cashback30d?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantStatsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantStats to aggregate.
     */
    where?: TenantStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantStats to fetch.
     */
    orderBy?: TenantStatsOrderByWithRelationInput | TenantStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantStats
    **/
    _count?: true | TenantStatsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TenantStatsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TenantStatsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantStatsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantStatsMaxAggregateInputType
  }

  export type GetTenantStatsAggregateType<T extends TenantStatsAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantStats]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantStats[P]>
      : GetScalarType<T[P], AggregateTenantStats[P]>
  }




  export type TenantStatsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantStatsWhereInput
    orderBy?: TenantStatsOrderByWithAggregationInput | TenantStatsOrderByWithAggregationInput[]
    by: TenantStatsScalarFieldEnum[] | TenantStatsScalarFieldEnum
    having?: TenantStatsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantStatsCountAggregateInputType | true
    _avg?: TenantStatsAvgAggregateInputType
    _sum?: TenantStatsSumAggregateInputType
    _min?: TenantStatsMinAggregateInputType
    _max?: TenantStatsMaxAggregateInputType
  }

  export type TenantStatsGroupByOutputType = {
    id: string
    tenantId: string
    totalUsers: number
    totalConsumers: number
    totalMerchants: number
    activeUsers30d: number
    totalPurchases: number
    totalRevenue: Decimal
    totalCashbackPaid: Decimal
    totalPlatformFees: Decimal
    totalProducts: number
    revenue30d: Decimal
    purchases30d: number
    cashback30d: Decimal
    createdAt: Date
    updatedAt: Date
    _count: TenantStatsCountAggregateOutputType | null
    _avg: TenantStatsAvgAggregateOutputType | null
    _sum: TenantStatsSumAggregateOutputType | null
    _min: TenantStatsMinAggregateOutputType | null
    _max: TenantStatsMaxAggregateOutputType | null
  }

  type GetTenantStatsGroupByPayload<T extends TenantStatsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantStatsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantStatsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantStatsGroupByOutputType[P]>
            : GetScalarType<T[P], TenantStatsGroupByOutputType[P]>
        }
      >
    >


  export type TenantStatsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    totalUsers?: boolean
    totalConsumers?: boolean
    totalMerchants?: boolean
    activeUsers30d?: boolean
    totalPurchases?: boolean
    totalRevenue?: boolean
    totalCashbackPaid?: boolean
    totalPlatformFees?: boolean
    totalProducts?: boolean
    revenue30d?: boolean
    purchases30d?: boolean
    cashback30d?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantStats"]>

  export type TenantStatsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    totalUsers?: boolean
    totalConsumers?: boolean
    totalMerchants?: boolean
    activeUsers30d?: boolean
    totalPurchases?: boolean
    totalRevenue?: boolean
    totalCashbackPaid?: boolean
    totalPlatformFees?: boolean
    totalProducts?: boolean
    revenue30d?: boolean
    purchases30d?: boolean
    cashback30d?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantStats"]>

  export type TenantStatsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    totalUsers?: boolean
    totalConsumers?: boolean
    totalMerchants?: boolean
    activeUsers30d?: boolean
    totalPurchases?: boolean
    totalRevenue?: boolean
    totalCashbackPaid?: boolean
    totalPlatformFees?: boolean
    totalProducts?: boolean
    revenue30d?: boolean
    purchases30d?: boolean
    cashback30d?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantStats"]>

  export type TenantStatsSelectScalar = {
    id?: boolean
    tenantId?: boolean
    totalUsers?: boolean
    totalConsumers?: boolean
    totalMerchants?: boolean
    activeUsers30d?: boolean
    totalPurchases?: boolean
    totalRevenue?: boolean
    totalCashbackPaid?: boolean
    totalPlatformFees?: boolean
    totalProducts?: boolean
    revenue30d?: boolean
    purchases30d?: boolean
    cashback30d?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantStatsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "totalUsers" | "totalConsumers" | "totalMerchants" | "activeUsers30d" | "totalPurchases" | "totalRevenue" | "totalCashbackPaid" | "totalPlatformFees" | "totalProducts" | "revenue30d" | "purchases30d" | "cashback30d" | "createdAt" | "updatedAt", ExtArgs["result"]["tenantStats"]>
  export type TenantStatsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantStatsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantStatsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $TenantStatsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantStats"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      totalUsers: number
      totalConsumers: number
      totalMerchants: number
      activeUsers30d: number
      totalPurchases: number
      totalRevenue: Prisma.Decimal
      totalCashbackPaid: Prisma.Decimal
      totalPlatformFees: Prisma.Decimal
      totalProducts: number
      revenue30d: Prisma.Decimal
      purchases30d: number
      cashback30d: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantStats"]>
    composites: {}
  }

  type TenantStatsGetPayload<S extends boolean | null | undefined | TenantStatsDefaultArgs> = $Result.GetResult<Prisma.$TenantStatsPayload, S>

  type TenantStatsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantStatsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantStatsCountAggregateInputType | true
    }

  export interface TenantStatsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantStats'], meta: { name: 'TenantStats' } }
    /**
     * Find zero or one TenantStats that matches the filter.
     * @param {TenantStatsFindUniqueArgs} args - Arguments to find a TenantStats
     * @example
     * // Get one TenantStats
     * const tenantStats = await prisma.tenantStats.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantStatsFindUniqueArgs>(args: SelectSubset<T, TenantStatsFindUniqueArgs<ExtArgs>>): Prisma__TenantStatsClient<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantStats that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantStatsFindUniqueOrThrowArgs} args - Arguments to find a TenantStats
     * @example
     * // Get one TenantStats
     * const tenantStats = await prisma.tenantStats.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantStatsFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantStatsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantStatsClient<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantStatsFindFirstArgs} args - Arguments to find a TenantStats
     * @example
     * // Get one TenantStats
     * const tenantStats = await prisma.tenantStats.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantStatsFindFirstArgs>(args?: SelectSubset<T, TenantStatsFindFirstArgs<ExtArgs>>): Prisma__TenantStatsClient<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantStats that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantStatsFindFirstOrThrowArgs} args - Arguments to find a TenantStats
     * @example
     * // Get one TenantStats
     * const tenantStats = await prisma.tenantStats.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantStatsFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantStatsFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantStatsClient<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantStatsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantStats
     * const tenantStats = await prisma.tenantStats.findMany()
     * 
     * // Get first 10 TenantStats
     * const tenantStats = await prisma.tenantStats.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantStatsWithIdOnly = await prisma.tenantStats.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantStatsFindManyArgs>(args?: SelectSubset<T, TenantStatsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantStats.
     * @param {TenantStatsCreateArgs} args - Arguments to create a TenantStats.
     * @example
     * // Create one TenantStats
     * const TenantStats = await prisma.tenantStats.create({
     *   data: {
     *     // ... data to create a TenantStats
     *   }
     * })
     * 
     */
    create<T extends TenantStatsCreateArgs>(args: SelectSubset<T, TenantStatsCreateArgs<ExtArgs>>): Prisma__TenantStatsClient<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantStats.
     * @param {TenantStatsCreateManyArgs} args - Arguments to create many TenantStats.
     * @example
     * // Create many TenantStats
     * const tenantStats = await prisma.tenantStats.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantStatsCreateManyArgs>(args?: SelectSubset<T, TenantStatsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantStats and returns the data saved in the database.
     * @param {TenantStatsCreateManyAndReturnArgs} args - Arguments to create many TenantStats.
     * @example
     * // Create many TenantStats
     * const tenantStats = await prisma.tenantStats.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantStats and only return the `id`
     * const tenantStatsWithIdOnly = await prisma.tenantStats.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantStatsCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantStatsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantStats.
     * @param {TenantStatsDeleteArgs} args - Arguments to delete one TenantStats.
     * @example
     * // Delete one TenantStats
     * const TenantStats = await prisma.tenantStats.delete({
     *   where: {
     *     // ... filter to delete one TenantStats
     *   }
     * })
     * 
     */
    delete<T extends TenantStatsDeleteArgs>(args: SelectSubset<T, TenantStatsDeleteArgs<ExtArgs>>): Prisma__TenantStatsClient<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantStats.
     * @param {TenantStatsUpdateArgs} args - Arguments to update one TenantStats.
     * @example
     * // Update one TenantStats
     * const tenantStats = await prisma.tenantStats.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantStatsUpdateArgs>(args: SelectSubset<T, TenantStatsUpdateArgs<ExtArgs>>): Prisma__TenantStatsClient<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantStats.
     * @param {TenantStatsDeleteManyArgs} args - Arguments to filter TenantStats to delete.
     * @example
     * // Delete a few TenantStats
     * const { count } = await prisma.tenantStats.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantStatsDeleteManyArgs>(args?: SelectSubset<T, TenantStatsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantStatsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantStats
     * const tenantStats = await prisma.tenantStats.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantStatsUpdateManyArgs>(args: SelectSubset<T, TenantStatsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantStats and returns the data updated in the database.
     * @param {TenantStatsUpdateManyAndReturnArgs} args - Arguments to update many TenantStats.
     * @example
     * // Update many TenantStats
     * const tenantStats = await prisma.tenantStats.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantStats and only return the `id`
     * const tenantStatsWithIdOnly = await prisma.tenantStats.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantStatsUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantStatsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantStats.
     * @param {TenantStatsUpsertArgs} args - Arguments to update or create a TenantStats.
     * @example
     * // Update or create a TenantStats
     * const tenantStats = await prisma.tenantStats.upsert({
     *   create: {
     *     // ... data to create a TenantStats
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantStats we want to update
     *   }
     * })
     */
    upsert<T extends TenantStatsUpsertArgs>(args: SelectSubset<T, TenantStatsUpsertArgs<ExtArgs>>): Prisma__TenantStatsClient<$Result.GetResult<Prisma.$TenantStatsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantStatsCountArgs} args - Arguments to filter TenantStats to count.
     * @example
     * // Count the number of TenantStats
     * const count = await prisma.tenantStats.count({
     *   where: {
     *     // ... the filter for the TenantStats we want to count
     *   }
     * })
    **/
    count<T extends TenantStatsCountArgs>(
      args?: Subset<T, TenantStatsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantStatsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantStatsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantStatsAggregateArgs>(args: Subset<T, TenantStatsAggregateArgs>): Prisma.PrismaPromise<GetTenantStatsAggregateType<T>>

    /**
     * Group by TenantStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantStatsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantStatsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantStatsGroupByArgs['orderBy'] }
        : { orderBy?: TenantStatsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantStatsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantStatsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantStats model
   */
  readonly fields: TenantStatsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantStats.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantStatsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantStats model
   */
  interface TenantStatsFieldRefs {
    readonly id: FieldRef<"TenantStats", 'String'>
    readonly tenantId: FieldRef<"TenantStats", 'String'>
    readonly totalUsers: FieldRef<"TenantStats", 'Int'>
    readonly totalConsumers: FieldRef<"TenantStats", 'Int'>
    readonly totalMerchants: FieldRef<"TenantStats", 'Int'>
    readonly activeUsers30d: FieldRef<"TenantStats", 'Int'>
    readonly totalPurchases: FieldRef<"TenantStats", 'Int'>
    readonly totalRevenue: FieldRef<"TenantStats", 'Decimal'>
    readonly totalCashbackPaid: FieldRef<"TenantStats", 'Decimal'>
    readonly totalPlatformFees: FieldRef<"TenantStats", 'Decimal'>
    readonly totalProducts: FieldRef<"TenantStats", 'Int'>
    readonly revenue30d: FieldRef<"TenantStats", 'Decimal'>
    readonly purchases30d: FieldRef<"TenantStats", 'Int'>
    readonly cashback30d: FieldRef<"TenantStats", 'Decimal'>
    readonly createdAt: FieldRef<"TenantStats", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantStats", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantStats findUnique
   */
  export type TenantStatsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsInclude<ExtArgs> | null
    /**
     * Filter, which TenantStats to fetch.
     */
    where: TenantStatsWhereUniqueInput
  }

  /**
   * TenantStats findUniqueOrThrow
   */
  export type TenantStatsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsInclude<ExtArgs> | null
    /**
     * Filter, which TenantStats to fetch.
     */
    where: TenantStatsWhereUniqueInput
  }

  /**
   * TenantStats findFirst
   */
  export type TenantStatsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsInclude<ExtArgs> | null
    /**
     * Filter, which TenantStats to fetch.
     */
    where?: TenantStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantStats to fetch.
     */
    orderBy?: TenantStatsOrderByWithRelationInput | TenantStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantStats.
     */
    cursor?: TenantStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantStats.
     */
    distinct?: TenantStatsScalarFieldEnum | TenantStatsScalarFieldEnum[]
  }

  /**
   * TenantStats findFirstOrThrow
   */
  export type TenantStatsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsInclude<ExtArgs> | null
    /**
     * Filter, which TenantStats to fetch.
     */
    where?: TenantStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantStats to fetch.
     */
    orderBy?: TenantStatsOrderByWithRelationInput | TenantStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantStats.
     */
    cursor?: TenantStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantStats.
     */
    distinct?: TenantStatsScalarFieldEnum | TenantStatsScalarFieldEnum[]
  }

  /**
   * TenantStats findMany
   */
  export type TenantStatsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsInclude<ExtArgs> | null
    /**
     * Filter, which TenantStats to fetch.
     */
    where?: TenantStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantStats to fetch.
     */
    orderBy?: TenantStatsOrderByWithRelationInput | TenantStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantStats.
     */
    cursor?: TenantStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantStats.
     */
    skip?: number
    distinct?: TenantStatsScalarFieldEnum | TenantStatsScalarFieldEnum[]
  }

  /**
   * TenantStats create
   */
  export type TenantStatsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantStats.
     */
    data: XOR<TenantStatsCreateInput, TenantStatsUncheckedCreateInput>
  }

  /**
   * TenantStats createMany
   */
  export type TenantStatsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantStats.
     */
    data: TenantStatsCreateManyInput | TenantStatsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantStats createManyAndReturn
   */
  export type TenantStatsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * The data used to create many TenantStats.
     */
    data: TenantStatsCreateManyInput | TenantStatsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantStats update
   */
  export type TenantStatsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantStats.
     */
    data: XOR<TenantStatsUpdateInput, TenantStatsUncheckedUpdateInput>
    /**
     * Choose, which TenantStats to update.
     */
    where: TenantStatsWhereUniqueInput
  }

  /**
   * TenantStats updateMany
   */
  export type TenantStatsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantStats.
     */
    data: XOR<TenantStatsUpdateManyMutationInput, TenantStatsUncheckedUpdateManyInput>
    /**
     * Filter which TenantStats to update
     */
    where?: TenantStatsWhereInput
    /**
     * Limit how many TenantStats to update.
     */
    limit?: number
  }

  /**
   * TenantStats updateManyAndReturn
   */
  export type TenantStatsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * The data used to update TenantStats.
     */
    data: XOR<TenantStatsUpdateManyMutationInput, TenantStatsUncheckedUpdateManyInput>
    /**
     * Filter which TenantStats to update
     */
    where?: TenantStatsWhereInput
    /**
     * Limit how many TenantStats to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantStats upsert
   */
  export type TenantStatsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantStats to update in case it exists.
     */
    where: TenantStatsWhereUniqueInput
    /**
     * In case the TenantStats found by the `where` argument doesn't exist, create a new TenantStats with this data.
     */
    create: XOR<TenantStatsCreateInput, TenantStatsUncheckedCreateInput>
    /**
     * In case the TenantStats was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantStatsUpdateInput, TenantStatsUncheckedUpdateInput>
  }

  /**
   * TenantStats delete
   */
  export type TenantStatsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsInclude<ExtArgs> | null
    /**
     * Filter which TenantStats to delete.
     */
    where: TenantStatsWhereUniqueInput
  }

  /**
   * TenantStats deleteMany
   */
  export type TenantStatsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantStats to delete
     */
    where?: TenantStatsWhereInput
    /**
     * Limit how many TenantStats to delete.
     */
    limit?: number
  }

  /**
   * TenantStats without action
   */
  export type TenantStatsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantStats
     */
    select?: TenantStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantStats
     */
    omit?: TenantStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantStatsInclude<ExtArgs> | null
  }


  /**
   * Model GlobalStats
   */

  export type AggregateGlobalStats = {
    _count: GlobalStatsCountAggregateOutputType | null
    _avg: GlobalStatsAvgAggregateOutputType | null
    _sum: GlobalStatsSumAggregateOutputType | null
    _min: GlobalStatsMinAggregateOutputType | null
    _max: GlobalStatsMaxAggregateOutputType | null
  }

  export type GlobalStatsAvgAggregateOutputType = {
    totalTenants: number | null
    totalUsers: number | null
    totalConsumers: number | null
    totalMerchants: number | null
    totalPurchases: number | null
    totalRevenue: Decimal | null
    totalCashbackPaid: Decimal | null
    totalPlatformFees: Decimal | null
    totalProducts: number | null
    activeUsers30d: number | null
    revenue30d: Decimal | null
    purchases30d: number | null
    cashback30d: Decimal | null
    newTenants: number | null
    newUsers: number | null
    churnedTenants: number | null
  }

  export type GlobalStatsSumAggregateOutputType = {
    totalTenants: number | null
    totalUsers: number | null
    totalConsumers: number | null
    totalMerchants: number | null
    totalPurchases: number | null
    totalRevenue: Decimal | null
    totalCashbackPaid: Decimal | null
    totalPlatformFees: Decimal | null
    totalProducts: number | null
    activeUsers30d: number | null
    revenue30d: Decimal | null
    purchases30d: number | null
    cashback30d: Decimal | null
    newTenants: number | null
    newUsers: number | null
    churnedTenants: number | null
  }

  export type GlobalStatsMinAggregateOutputType = {
    id: string | null
    date: Date | null
    totalTenants: number | null
    totalUsers: number | null
    totalConsumers: number | null
    totalMerchants: number | null
    totalPurchases: number | null
    totalRevenue: Decimal | null
    totalCashbackPaid: Decimal | null
    totalPlatformFees: Decimal | null
    totalProducts: number | null
    activeUsers30d: number | null
    revenue30d: Decimal | null
    purchases30d: number | null
    cashback30d: Decimal | null
    newTenants: number | null
    newUsers: number | null
    churnedTenants: number | null
    createdAt: Date | null
  }

  export type GlobalStatsMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    totalTenants: number | null
    totalUsers: number | null
    totalConsumers: number | null
    totalMerchants: number | null
    totalPurchases: number | null
    totalRevenue: Decimal | null
    totalCashbackPaid: Decimal | null
    totalPlatformFees: Decimal | null
    totalProducts: number | null
    activeUsers30d: number | null
    revenue30d: Decimal | null
    purchases30d: number | null
    cashback30d: Decimal | null
    newTenants: number | null
    newUsers: number | null
    churnedTenants: number | null
    createdAt: Date | null
  }

  export type GlobalStatsCountAggregateOutputType = {
    id: number
    date: number
    totalTenants: number
    totalUsers: number
    totalConsumers: number
    totalMerchants: number
    totalPurchases: number
    totalRevenue: number
    totalCashbackPaid: number
    totalPlatformFees: number
    totalProducts: number
    activeUsers30d: number
    revenue30d: number
    purchases30d: number
    cashback30d: number
    newTenants: number
    newUsers: number
    churnedTenants: number
    createdAt: number
    _all: number
  }


  export type GlobalStatsAvgAggregateInputType = {
    totalTenants?: true
    totalUsers?: true
    totalConsumers?: true
    totalMerchants?: true
    totalPurchases?: true
    totalRevenue?: true
    totalCashbackPaid?: true
    totalPlatformFees?: true
    totalProducts?: true
    activeUsers30d?: true
    revenue30d?: true
    purchases30d?: true
    cashback30d?: true
    newTenants?: true
    newUsers?: true
    churnedTenants?: true
  }

  export type GlobalStatsSumAggregateInputType = {
    totalTenants?: true
    totalUsers?: true
    totalConsumers?: true
    totalMerchants?: true
    totalPurchases?: true
    totalRevenue?: true
    totalCashbackPaid?: true
    totalPlatformFees?: true
    totalProducts?: true
    activeUsers30d?: true
    revenue30d?: true
    purchases30d?: true
    cashback30d?: true
    newTenants?: true
    newUsers?: true
    churnedTenants?: true
  }

  export type GlobalStatsMinAggregateInputType = {
    id?: true
    date?: true
    totalTenants?: true
    totalUsers?: true
    totalConsumers?: true
    totalMerchants?: true
    totalPurchases?: true
    totalRevenue?: true
    totalCashbackPaid?: true
    totalPlatformFees?: true
    totalProducts?: true
    activeUsers30d?: true
    revenue30d?: true
    purchases30d?: true
    cashback30d?: true
    newTenants?: true
    newUsers?: true
    churnedTenants?: true
    createdAt?: true
  }

  export type GlobalStatsMaxAggregateInputType = {
    id?: true
    date?: true
    totalTenants?: true
    totalUsers?: true
    totalConsumers?: true
    totalMerchants?: true
    totalPurchases?: true
    totalRevenue?: true
    totalCashbackPaid?: true
    totalPlatformFees?: true
    totalProducts?: true
    activeUsers30d?: true
    revenue30d?: true
    purchases30d?: true
    cashback30d?: true
    newTenants?: true
    newUsers?: true
    churnedTenants?: true
    createdAt?: true
  }

  export type GlobalStatsCountAggregateInputType = {
    id?: true
    date?: true
    totalTenants?: true
    totalUsers?: true
    totalConsumers?: true
    totalMerchants?: true
    totalPurchases?: true
    totalRevenue?: true
    totalCashbackPaid?: true
    totalPlatformFees?: true
    totalProducts?: true
    activeUsers30d?: true
    revenue30d?: true
    purchases30d?: true
    cashback30d?: true
    newTenants?: true
    newUsers?: true
    churnedTenants?: true
    createdAt?: true
    _all?: true
  }

  export type GlobalStatsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GlobalStats to aggregate.
     */
    where?: GlobalStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalStats to fetch.
     */
    orderBy?: GlobalStatsOrderByWithRelationInput | GlobalStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GlobalStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GlobalStats
    **/
    _count?: true | GlobalStatsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GlobalStatsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GlobalStatsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GlobalStatsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GlobalStatsMaxAggregateInputType
  }

  export type GetGlobalStatsAggregateType<T extends GlobalStatsAggregateArgs> = {
        [P in keyof T & keyof AggregateGlobalStats]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGlobalStats[P]>
      : GetScalarType<T[P], AggregateGlobalStats[P]>
  }




  export type GlobalStatsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GlobalStatsWhereInput
    orderBy?: GlobalStatsOrderByWithAggregationInput | GlobalStatsOrderByWithAggregationInput[]
    by: GlobalStatsScalarFieldEnum[] | GlobalStatsScalarFieldEnum
    having?: GlobalStatsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GlobalStatsCountAggregateInputType | true
    _avg?: GlobalStatsAvgAggregateInputType
    _sum?: GlobalStatsSumAggregateInputType
    _min?: GlobalStatsMinAggregateInputType
    _max?: GlobalStatsMaxAggregateInputType
  }

  export type GlobalStatsGroupByOutputType = {
    id: string
    date: Date
    totalTenants: number
    totalUsers: number
    totalConsumers: number
    totalMerchants: number
    totalPurchases: number
    totalRevenue: Decimal
    totalCashbackPaid: Decimal
    totalPlatformFees: Decimal
    totalProducts: number
    activeUsers30d: number
    revenue30d: Decimal
    purchases30d: number
    cashback30d: Decimal
    newTenants: number
    newUsers: number
    churnedTenants: number
    createdAt: Date
    _count: GlobalStatsCountAggregateOutputType | null
    _avg: GlobalStatsAvgAggregateOutputType | null
    _sum: GlobalStatsSumAggregateOutputType | null
    _min: GlobalStatsMinAggregateOutputType | null
    _max: GlobalStatsMaxAggregateOutputType | null
  }

  type GetGlobalStatsGroupByPayload<T extends GlobalStatsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GlobalStatsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GlobalStatsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GlobalStatsGroupByOutputType[P]>
            : GetScalarType<T[P], GlobalStatsGroupByOutputType[P]>
        }
      >
    >


  export type GlobalStatsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalTenants?: boolean
    totalUsers?: boolean
    totalConsumers?: boolean
    totalMerchants?: boolean
    totalPurchases?: boolean
    totalRevenue?: boolean
    totalCashbackPaid?: boolean
    totalPlatformFees?: boolean
    totalProducts?: boolean
    activeUsers30d?: boolean
    revenue30d?: boolean
    purchases30d?: boolean
    cashback30d?: boolean
    newTenants?: boolean
    newUsers?: boolean
    churnedTenants?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["globalStats"]>

  export type GlobalStatsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalTenants?: boolean
    totalUsers?: boolean
    totalConsumers?: boolean
    totalMerchants?: boolean
    totalPurchases?: boolean
    totalRevenue?: boolean
    totalCashbackPaid?: boolean
    totalPlatformFees?: boolean
    totalProducts?: boolean
    activeUsers30d?: boolean
    revenue30d?: boolean
    purchases30d?: boolean
    cashback30d?: boolean
    newTenants?: boolean
    newUsers?: boolean
    churnedTenants?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["globalStats"]>

  export type GlobalStatsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalTenants?: boolean
    totalUsers?: boolean
    totalConsumers?: boolean
    totalMerchants?: boolean
    totalPurchases?: boolean
    totalRevenue?: boolean
    totalCashbackPaid?: boolean
    totalPlatformFees?: boolean
    totalProducts?: boolean
    activeUsers30d?: boolean
    revenue30d?: boolean
    purchases30d?: boolean
    cashback30d?: boolean
    newTenants?: boolean
    newUsers?: boolean
    churnedTenants?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["globalStats"]>

  export type GlobalStatsSelectScalar = {
    id?: boolean
    date?: boolean
    totalTenants?: boolean
    totalUsers?: boolean
    totalConsumers?: boolean
    totalMerchants?: boolean
    totalPurchases?: boolean
    totalRevenue?: boolean
    totalCashbackPaid?: boolean
    totalPlatformFees?: boolean
    totalProducts?: boolean
    activeUsers30d?: boolean
    revenue30d?: boolean
    purchases30d?: boolean
    cashback30d?: boolean
    newTenants?: boolean
    newUsers?: boolean
    churnedTenants?: boolean
    createdAt?: boolean
  }

  export type GlobalStatsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "date" | "totalTenants" | "totalUsers" | "totalConsumers" | "totalMerchants" | "totalPurchases" | "totalRevenue" | "totalCashbackPaid" | "totalPlatformFees" | "totalProducts" | "activeUsers30d" | "revenue30d" | "purchases30d" | "cashback30d" | "newTenants" | "newUsers" | "churnedTenants" | "createdAt", ExtArgs["result"]["globalStats"]>

  export type $GlobalStatsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GlobalStats"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      totalTenants: number
      totalUsers: number
      totalConsumers: number
      totalMerchants: number
      totalPurchases: number
      totalRevenue: Prisma.Decimal
      totalCashbackPaid: Prisma.Decimal
      totalPlatformFees: Prisma.Decimal
      totalProducts: number
      activeUsers30d: number
      revenue30d: Prisma.Decimal
      purchases30d: number
      cashback30d: Prisma.Decimal
      newTenants: number
      newUsers: number
      churnedTenants: number
      createdAt: Date
    }, ExtArgs["result"]["globalStats"]>
    composites: {}
  }

  type GlobalStatsGetPayload<S extends boolean | null | undefined | GlobalStatsDefaultArgs> = $Result.GetResult<Prisma.$GlobalStatsPayload, S>

  type GlobalStatsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GlobalStatsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GlobalStatsCountAggregateInputType | true
    }

  export interface GlobalStatsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GlobalStats'], meta: { name: 'GlobalStats' } }
    /**
     * Find zero or one GlobalStats that matches the filter.
     * @param {GlobalStatsFindUniqueArgs} args - Arguments to find a GlobalStats
     * @example
     * // Get one GlobalStats
     * const globalStats = await prisma.globalStats.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GlobalStatsFindUniqueArgs>(args: SelectSubset<T, GlobalStatsFindUniqueArgs<ExtArgs>>): Prisma__GlobalStatsClient<$Result.GetResult<Prisma.$GlobalStatsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GlobalStats that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GlobalStatsFindUniqueOrThrowArgs} args - Arguments to find a GlobalStats
     * @example
     * // Get one GlobalStats
     * const globalStats = await prisma.globalStats.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GlobalStatsFindUniqueOrThrowArgs>(args: SelectSubset<T, GlobalStatsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GlobalStatsClient<$Result.GetResult<Prisma.$GlobalStatsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GlobalStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalStatsFindFirstArgs} args - Arguments to find a GlobalStats
     * @example
     * // Get one GlobalStats
     * const globalStats = await prisma.globalStats.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GlobalStatsFindFirstArgs>(args?: SelectSubset<T, GlobalStatsFindFirstArgs<ExtArgs>>): Prisma__GlobalStatsClient<$Result.GetResult<Prisma.$GlobalStatsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GlobalStats that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalStatsFindFirstOrThrowArgs} args - Arguments to find a GlobalStats
     * @example
     * // Get one GlobalStats
     * const globalStats = await prisma.globalStats.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GlobalStatsFindFirstOrThrowArgs>(args?: SelectSubset<T, GlobalStatsFindFirstOrThrowArgs<ExtArgs>>): Prisma__GlobalStatsClient<$Result.GetResult<Prisma.$GlobalStatsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GlobalStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalStatsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GlobalStats
     * const globalStats = await prisma.globalStats.findMany()
     * 
     * // Get first 10 GlobalStats
     * const globalStats = await prisma.globalStats.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const globalStatsWithIdOnly = await prisma.globalStats.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GlobalStatsFindManyArgs>(args?: SelectSubset<T, GlobalStatsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GlobalStatsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GlobalStats.
     * @param {GlobalStatsCreateArgs} args - Arguments to create a GlobalStats.
     * @example
     * // Create one GlobalStats
     * const GlobalStats = await prisma.globalStats.create({
     *   data: {
     *     // ... data to create a GlobalStats
     *   }
     * })
     * 
     */
    create<T extends GlobalStatsCreateArgs>(args: SelectSubset<T, GlobalStatsCreateArgs<ExtArgs>>): Prisma__GlobalStatsClient<$Result.GetResult<Prisma.$GlobalStatsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GlobalStats.
     * @param {GlobalStatsCreateManyArgs} args - Arguments to create many GlobalStats.
     * @example
     * // Create many GlobalStats
     * const globalStats = await prisma.globalStats.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GlobalStatsCreateManyArgs>(args?: SelectSubset<T, GlobalStatsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GlobalStats and returns the data saved in the database.
     * @param {GlobalStatsCreateManyAndReturnArgs} args - Arguments to create many GlobalStats.
     * @example
     * // Create many GlobalStats
     * const globalStats = await prisma.globalStats.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GlobalStats and only return the `id`
     * const globalStatsWithIdOnly = await prisma.globalStats.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GlobalStatsCreateManyAndReturnArgs>(args?: SelectSubset<T, GlobalStatsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GlobalStatsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GlobalStats.
     * @param {GlobalStatsDeleteArgs} args - Arguments to delete one GlobalStats.
     * @example
     * // Delete one GlobalStats
     * const GlobalStats = await prisma.globalStats.delete({
     *   where: {
     *     // ... filter to delete one GlobalStats
     *   }
     * })
     * 
     */
    delete<T extends GlobalStatsDeleteArgs>(args: SelectSubset<T, GlobalStatsDeleteArgs<ExtArgs>>): Prisma__GlobalStatsClient<$Result.GetResult<Prisma.$GlobalStatsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GlobalStats.
     * @param {GlobalStatsUpdateArgs} args - Arguments to update one GlobalStats.
     * @example
     * // Update one GlobalStats
     * const globalStats = await prisma.globalStats.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GlobalStatsUpdateArgs>(args: SelectSubset<T, GlobalStatsUpdateArgs<ExtArgs>>): Prisma__GlobalStatsClient<$Result.GetResult<Prisma.$GlobalStatsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GlobalStats.
     * @param {GlobalStatsDeleteManyArgs} args - Arguments to filter GlobalStats to delete.
     * @example
     * // Delete a few GlobalStats
     * const { count } = await prisma.globalStats.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GlobalStatsDeleteManyArgs>(args?: SelectSubset<T, GlobalStatsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GlobalStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalStatsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GlobalStats
     * const globalStats = await prisma.globalStats.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GlobalStatsUpdateManyArgs>(args: SelectSubset<T, GlobalStatsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GlobalStats and returns the data updated in the database.
     * @param {GlobalStatsUpdateManyAndReturnArgs} args - Arguments to update many GlobalStats.
     * @example
     * // Update many GlobalStats
     * const globalStats = await prisma.globalStats.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GlobalStats and only return the `id`
     * const globalStatsWithIdOnly = await prisma.globalStats.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GlobalStatsUpdateManyAndReturnArgs>(args: SelectSubset<T, GlobalStatsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GlobalStatsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GlobalStats.
     * @param {GlobalStatsUpsertArgs} args - Arguments to update or create a GlobalStats.
     * @example
     * // Update or create a GlobalStats
     * const globalStats = await prisma.globalStats.upsert({
     *   create: {
     *     // ... data to create a GlobalStats
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GlobalStats we want to update
     *   }
     * })
     */
    upsert<T extends GlobalStatsUpsertArgs>(args: SelectSubset<T, GlobalStatsUpsertArgs<ExtArgs>>): Prisma__GlobalStatsClient<$Result.GetResult<Prisma.$GlobalStatsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GlobalStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalStatsCountArgs} args - Arguments to filter GlobalStats to count.
     * @example
     * // Count the number of GlobalStats
     * const count = await prisma.globalStats.count({
     *   where: {
     *     // ... the filter for the GlobalStats we want to count
     *   }
     * })
    **/
    count<T extends GlobalStatsCountArgs>(
      args?: Subset<T, GlobalStatsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GlobalStatsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GlobalStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalStatsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GlobalStatsAggregateArgs>(args: Subset<T, GlobalStatsAggregateArgs>): Prisma.PrismaPromise<GetGlobalStatsAggregateType<T>>

    /**
     * Group by GlobalStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalStatsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GlobalStatsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GlobalStatsGroupByArgs['orderBy'] }
        : { orderBy?: GlobalStatsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GlobalStatsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGlobalStatsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GlobalStats model
   */
  readonly fields: GlobalStatsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GlobalStats.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GlobalStatsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GlobalStats model
   */
  interface GlobalStatsFieldRefs {
    readonly id: FieldRef<"GlobalStats", 'String'>
    readonly date: FieldRef<"GlobalStats", 'DateTime'>
    readonly totalTenants: FieldRef<"GlobalStats", 'Int'>
    readonly totalUsers: FieldRef<"GlobalStats", 'Int'>
    readonly totalConsumers: FieldRef<"GlobalStats", 'Int'>
    readonly totalMerchants: FieldRef<"GlobalStats", 'Int'>
    readonly totalPurchases: FieldRef<"GlobalStats", 'Int'>
    readonly totalRevenue: FieldRef<"GlobalStats", 'Decimal'>
    readonly totalCashbackPaid: FieldRef<"GlobalStats", 'Decimal'>
    readonly totalPlatformFees: FieldRef<"GlobalStats", 'Decimal'>
    readonly totalProducts: FieldRef<"GlobalStats", 'Int'>
    readonly activeUsers30d: FieldRef<"GlobalStats", 'Int'>
    readonly revenue30d: FieldRef<"GlobalStats", 'Decimal'>
    readonly purchases30d: FieldRef<"GlobalStats", 'Int'>
    readonly cashback30d: FieldRef<"GlobalStats", 'Decimal'>
    readonly newTenants: FieldRef<"GlobalStats", 'Int'>
    readonly newUsers: FieldRef<"GlobalStats", 'Int'>
    readonly churnedTenants: FieldRef<"GlobalStats", 'Int'>
    readonly createdAt: FieldRef<"GlobalStats", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GlobalStats findUnique
   */
  export type GlobalStatsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
    /**
     * Filter, which GlobalStats to fetch.
     */
    where: GlobalStatsWhereUniqueInput
  }

  /**
   * GlobalStats findUniqueOrThrow
   */
  export type GlobalStatsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
    /**
     * Filter, which GlobalStats to fetch.
     */
    where: GlobalStatsWhereUniqueInput
  }

  /**
   * GlobalStats findFirst
   */
  export type GlobalStatsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
    /**
     * Filter, which GlobalStats to fetch.
     */
    where?: GlobalStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalStats to fetch.
     */
    orderBy?: GlobalStatsOrderByWithRelationInput | GlobalStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GlobalStats.
     */
    cursor?: GlobalStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GlobalStats.
     */
    distinct?: GlobalStatsScalarFieldEnum | GlobalStatsScalarFieldEnum[]
  }

  /**
   * GlobalStats findFirstOrThrow
   */
  export type GlobalStatsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
    /**
     * Filter, which GlobalStats to fetch.
     */
    where?: GlobalStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalStats to fetch.
     */
    orderBy?: GlobalStatsOrderByWithRelationInput | GlobalStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GlobalStats.
     */
    cursor?: GlobalStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GlobalStats.
     */
    distinct?: GlobalStatsScalarFieldEnum | GlobalStatsScalarFieldEnum[]
  }

  /**
   * GlobalStats findMany
   */
  export type GlobalStatsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
    /**
     * Filter, which GlobalStats to fetch.
     */
    where?: GlobalStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalStats to fetch.
     */
    orderBy?: GlobalStatsOrderByWithRelationInput | GlobalStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GlobalStats.
     */
    cursor?: GlobalStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalStats.
     */
    skip?: number
    distinct?: GlobalStatsScalarFieldEnum | GlobalStatsScalarFieldEnum[]
  }

  /**
   * GlobalStats create
   */
  export type GlobalStatsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
    /**
     * The data needed to create a GlobalStats.
     */
    data: XOR<GlobalStatsCreateInput, GlobalStatsUncheckedCreateInput>
  }

  /**
   * GlobalStats createMany
   */
  export type GlobalStatsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GlobalStats.
     */
    data: GlobalStatsCreateManyInput | GlobalStatsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GlobalStats createManyAndReturn
   */
  export type GlobalStatsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
    /**
     * The data used to create many GlobalStats.
     */
    data: GlobalStatsCreateManyInput | GlobalStatsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GlobalStats update
   */
  export type GlobalStatsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
    /**
     * The data needed to update a GlobalStats.
     */
    data: XOR<GlobalStatsUpdateInput, GlobalStatsUncheckedUpdateInput>
    /**
     * Choose, which GlobalStats to update.
     */
    where: GlobalStatsWhereUniqueInput
  }

  /**
   * GlobalStats updateMany
   */
  export type GlobalStatsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GlobalStats.
     */
    data: XOR<GlobalStatsUpdateManyMutationInput, GlobalStatsUncheckedUpdateManyInput>
    /**
     * Filter which GlobalStats to update
     */
    where?: GlobalStatsWhereInput
    /**
     * Limit how many GlobalStats to update.
     */
    limit?: number
  }

  /**
   * GlobalStats updateManyAndReturn
   */
  export type GlobalStatsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
    /**
     * The data used to update GlobalStats.
     */
    data: XOR<GlobalStatsUpdateManyMutationInput, GlobalStatsUncheckedUpdateManyInput>
    /**
     * Filter which GlobalStats to update
     */
    where?: GlobalStatsWhereInput
    /**
     * Limit how many GlobalStats to update.
     */
    limit?: number
  }

  /**
   * GlobalStats upsert
   */
  export type GlobalStatsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
    /**
     * The filter to search for the GlobalStats to update in case it exists.
     */
    where: GlobalStatsWhereUniqueInput
    /**
     * In case the GlobalStats found by the `where` argument doesn't exist, create a new GlobalStats with this data.
     */
    create: XOR<GlobalStatsCreateInput, GlobalStatsUncheckedCreateInput>
    /**
     * In case the GlobalStats was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GlobalStatsUpdateInput, GlobalStatsUncheckedUpdateInput>
  }

  /**
   * GlobalStats delete
   */
  export type GlobalStatsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
    /**
     * Filter which GlobalStats to delete.
     */
    where: GlobalStatsWhereUniqueInput
  }

  /**
   * GlobalStats deleteMany
   */
  export type GlobalStatsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GlobalStats to delete
     */
    where?: GlobalStatsWhereInput
    /**
     * Limit how many GlobalStats to delete.
     */
    limit?: number
  }

  /**
   * GlobalStats without action
   */
  export type GlobalStatsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalStats
     */
    select?: GlobalStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalStats
     */
    omit?: GlobalStatsOmit<ExtArgs> | null
  }


  /**
   * Model TenantCashbackConfig
   */

  export type AggregateTenantCashbackConfig = {
    _count: TenantCashbackConfigCountAggregateOutputType | null
    _avg: TenantCashbackConfigAvgAggregateOutputType | null
    _sum: TenantCashbackConfigSumAggregateOutputType | null
    _min: TenantCashbackConfigMinAggregateOutputType | null
    _max: TenantCashbackConfigMaxAggregateOutputType | null
  }

  export type TenantCashbackConfigAvgAggregateOutputType = {
    consumerPercent: Decimal | null
    clubPercent: Decimal | null
    consumerReferrerPercent: Decimal | null
    merchantReferrerPercent: Decimal | null
  }

  export type TenantCashbackConfigSumAggregateOutputType = {
    consumerPercent: Decimal | null
    clubPercent: Decimal | null
    consumerReferrerPercent: Decimal | null
    merchantReferrerPercent: Decimal | null
  }

  export type TenantCashbackConfigMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    consumerPercent: Decimal | null
    clubPercent: Decimal | null
    consumerReferrerPercent: Decimal | null
    merchantReferrerPercent: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantCashbackConfigMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    consumerPercent: Decimal | null
    clubPercent: Decimal | null
    consumerReferrerPercent: Decimal | null
    merchantReferrerPercent: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantCashbackConfigCountAggregateOutputType = {
    id: number
    tenantId: number
    consumerPercent: number
    clubPercent: number
    consumerReferrerPercent: number
    merchantReferrerPercent: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantCashbackConfigAvgAggregateInputType = {
    consumerPercent?: true
    clubPercent?: true
    consumerReferrerPercent?: true
    merchantReferrerPercent?: true
  }

  export type TenantCashbackConfigSumAggregateInputType = {
    consumerPercent?: true
    clubPercent?: true
    consumerReferrerPercent?: true
    merchantReferrerPercent?: true
  }

  export type TenantCashbackConfigMinAggregateInputType = {
    id?: true
    tenantId?: true
    consumerPercent?: true
    clubPercent?: true
    consumerReferrerPercent?: true
    merchantReferrerPercent?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantCashbackConfigMaxAggregateInputType = {
    id?: true
    tenantId?: true
    consumerPercent?: true
    clubPercent?: true
    consumerReferrerPercent?: true
    merchantReferrerPercent?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantCashbackConfigCountAggregateInputType = {
    id?: true
    tenantId?: true
    consumerPercent?: true
    clubPercent?: true
    consumerReferrerPercent?: true
    merchantReferrerPercent?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantCashbackConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantCashbackConfig to aggregate.
     */
    where?: TenantCashbackConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantCashbackConfigs to fetch.
     */
    orderBy?: TenantCashbackConfigOrderByWithRelationInput | TenantCashbackConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantCashbackConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantCashbackConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantCashbackConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantCashbackConfigs
    **/
    _count?: true | TenantCashbackConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TenantCashbackConfigAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TenantCashbackConfigSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantCashbackConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantCashbackConfigMaxAggregateInputType
  }

  export type GetTenantCashbackConfigAggregateType<T extends TenantCashbackConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantCashbackConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantCashbackConfig[P]>
      : GetScalarType<T[P], AggregateTenantCashbackConfig[P]>
  }




  export type TenantCashbackConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantCashbackConfigWhereInput
    orderBy?: TenantCashbackConfigOrderByWithAggregationInput | TenantCashbackConfigOrderByWithAggregationInput[]
    by: TenantCashbackConfigScalarFieldEnum[] | TenantCashbackConfigScalarFieldEnum
    having?: TenantCashbackConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCashbackConfigCountAggregateInputType | true
    _avg?: TenantCashbackConfigAvgAggregateInputType
    _sum?: TenantCashbackConfigSumAggregateInputType
    _min?: TenantCashbackConfigMinAggregateInputType
    _max?: TenantCashbackConfigMaxAggregateInputType
  }

  export type TenantCashbackConfigGroupByOutputType = {
    id: string
    tenantId: string
    consumerPercent: Decimal
    clubPercent: Decimal
    consumerReferrerPercent: Decimal
    merchantReferrerPercent: Decimal
    createdAt: Date
    updatedAt: Date
    _count: TenantCashbackConfigCountAggregateOutputType | null
    _avg: TenantCashbackConfigAvgAggregateOutputType | null
    _sum: TenantCashbackConfigSumAggregateOutputType | null
    _min: TenantCashbackConfigMinAggregateOutputType | null
    _max: TenantCashbackConfigMaxAggregateOutputType | null
  }

  type GetTenantCashbackConfigGroupByPayload<T extends TenantCashbackConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantCashbackConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantCashbackConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantCashbackConfigGroupByOutputType[P]>
            : GetScalarType<T[P], TenantCashbackConfigGroupByOutputType[P]>
        }
      >
    >


  export type TenantCashbackConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    consumerPercent?: boolean
    clubPercent?: boolean
    consumerReferrerPercent?: boolean
    merchantReferrerPercent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantCashbackConfig"]>

  export type TenantCashbackConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    consumerPercent?: boolean
    clubPercent?: boolean
    consumerReferrerPercent?: boolean
    merchantReferrerPercent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantCashbackConfig"]>

  export type TenantCashbackConfigSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    consumerPercent?: boolean
    clubPercent?: boolean
    consumerReferrerPercent?: boolean
    merchantReferrerPercent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantCashbackConfig"]>

  export type TenantCashbackConfigSelectScalar = {
    id?: boolean
    tenantId?: boolean
    consumerPercent?: boolean
    clubPercent?: boolean
    consumerReferrerPercent?: boolean
    merchantReferrerPercent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantCashbackConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "consumerPercent" | "clubPercent" | "consumerReferrerPercent" | "merchantReferrerPercent" | "createdAt" | "updatedAt", ExtArgs["result"]["tenantCashbackConfig"]>
  export type TenantCashbackConfigInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantCashbackConfigIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantCashbackConfigIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $TenantCashbackConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantCashbackConfig"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      consumerPercent: Prisma.Decimal
      clubPercent: Prisma.Decimal
      consumerReferrerPercent: Prisma.Decimal
      merchantReferrerPercent: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantCashbackConfig"]>
    composites: {}
  }

  type TenantCashbackConfigGetPayload<S extends boolean | null | undefined | TenantCashbackConfigDefaultArgs> = $Result.GetResult<Prisma.$TenantCashbackConfigPayload, S>

  type TenantCashbackConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantCashbackConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantCashbackConfigCountAggregateInputType | true
    }

  export interface TenantCashbackConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantCashbackConfig'], meta: { name: 'TenantCashbackConfig' } }
    /**
     * Find zero or one TenantCashbackConfig that matches the filter.
     * @param {TenantCashbackConfigFindUniqueArgs} args - Arguments to find a TenantCashbackConfig
     * @example
     * // Get one TenantCashbackConfig
     * const tenantCashbackConfig = await prisma.tenantCashbackConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantCashbackConfigFindUniqueArgs>(args: SelectSubset<T, TenantCashbackConfigFindUniqueArgs<ExtArgs>>): Prisma__TenantCashbackConfigClient<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantCashbackConfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantCashbackConfigFindUniqueOrThrowArgs} args - Arguments to find a TenantCashbackConfig
     * @example
     * // Get one TenantCashbackConfig
     * const tenantCashbackConfig = await prisma.tenantCashbackConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantCashbackConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantCashbackConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantCashbackConfigClient<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantCashbackConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCashbackConfigFindFirstArgs} args - Arguments to find a TenantCashbackConfig
     * @example
     * // Get one TenantCashbackConfig
     * const tenantCashbackConfig = await prisma.tenantCashbackConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantCashbackConfigFindFirstArgs>(args?: SelectSubset<T, TenantCashbackConfigFindFirstArgs<ExtArgs>>): Prisma__TenantCashbackConfigClient<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantCashbackConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCashbackConfigFindFirstOrThrowArgs} args - Arguments to find a TenantCashbackConfig
     * @example
     * // Get one TenantCashbackConfig
     * const tenantCashbackConfig = await prisma.tenantCashbackConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantCashbackConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantCashbackConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantCashbackConfigClient<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantCashbackConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCashbackConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantCashbackConfigs
     * const tenantCashbackConfigs = await prisma.tenantCashbackConfig.findMany()
     * 
     * // Get first 10 TenantCashbackConfigs
     * const tenantCashbackConfigs = await prisma.tenantCashbackConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantCashbackConfigWithIdOnly = await prisma.tenantCashbackConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantCashbackConfigFindManyArgs>(args?: SelectSubset<T, TenantCashbackConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantCashbackConfig.
     * @param {TenantCashbackConfigCreateArgs} args - Arguments to create a TenantCashbackConfig.
     * @example
     * // Create one TenantCashbackConfig
     * const TenantCashbackConfig = await prisma.tenantCashbackConfig.create({
     *   data: {
     *     // ... data to create a TenantCashbackConfig
     *   }
     * })
     * 
     */
    create<T extends TenantCashbackConfigCreateArgs>(args: SelectSubset<T, TenantCashbackConfigCreateArgs<ExtArgs>>): Prisma__TenantCashbackConfigClient<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantCashbackConfigs.
     * @param {TenantCashbackConfigCreateManyArgs} args - Arguments to create many TenantCashbackConfigs.
     * @example
     * // Create many TenantCashbackConfigs
     * const tenantCashbackConfig = await prisma.tenantCashbackConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCashbackConfigCreateManyArgs>(args?: SelectSubset<T, TenantCashbackConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantCashbackConfigs and returns the data saved in the database.
     * @param {TenantCashbackConfigCreateManyAndReturnArgs} args - Arguments to create many TenantCashbackConfigs.
     * @example
     * // Create many TenantCashbackConfigs
     * const tenantCashbackConfig = await prisma.tenantCashbackConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantCashbackConfigs and only return the `id`
     * const tenantCashbackConfigWithIdOnly = await prisma.tenantCashbackConfig.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCashbackConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCashbackConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantCashbackConfig.
     * @param {TenantCashbackConfigDeleteArgs} args - Arguments to delete one TenantCashbackConfig.
     * @example
     * // Delete one TenantCashbackConfig
     * const TenantCashbackConfig = await prisma.tenantCashbackConfig.delete({
     *   where: {
     *     // ... filter to delete one TenantCashbackConfig
     *   }
     * })
     * 
     */
    delete<T extends TenantCashbackConfigDeleteArgs>(args: SelectSubset<T, TenantCashbackConfigDeleteArgs<ExtArgs>>): Prisma__TenantCashbackConfigClient<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantCashbackConfig.
     * @param {TenantCashbackConfigUpdateArgs} args - Arguments to update one TenantCashbackConfig.
     * @example
     * // Update one TenantCashbackConfig
     * const tenantCashbackConfig = await prisma.tenantCashbackConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantCashbackConfigUpdateArgs>(args: SelectSubset<T, TenantCashbackConfigUpdateArgs<ExtArgs>>): Prisma__TenantCashbackConfigClient<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantCashbackConfigs.
     * @param {TenantCashbackConfigDeleteManyArgs} args - Arguments to filter TenantCashbackConfigs to delete.
     * @example
     * // Delete a few TenantCashbackConfigs
     * const { count } = await prisma.tenantCashbackConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantCashbackConfigDeleteManyArgs>(args?: SelectSubset<T, TenantCashbackConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantCashbackConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCashbackConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantCashbackConfigs
     * const tenantCashbackConfig = await prisma.tenantCashbackConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantCashbackConfigUpdateManyArgs>(args: SelectSubset<T, TenantCashbackConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantCashbackConfigs and returns the data updated in the database.
     * @param {TenantCashbackConfigUpdateManyAndReturnArgs} args - Arguments to update many TenantCashbackConfigs.
     * @example
     * // Update many TenantCashbackConfigs
     * const tenantCashbackConfig = await prisma.tenantCashbackConfig.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantCashbackConfigs and only return the `id`
     * const tenantCashbackConfigWithIdOnly = await prisma.tenantCashbackConfig.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantCashbackConfigUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantCashbackConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantCashbackConfig.
     * @param {TenantCashbackConfigUpsertArgs} args - Arguments to update or create a TenantCashbackConfig.
     * @example
     * // Update or create a TenantCashbackConfig
     * const tenantCashbackConfig = await prisma.tenantCashbackConfig.upsert({
     *   create: {
     *     // ... data to create a TenantCashbackConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantCashbackConfig we want to update
     *   }
     * })
     */
    upsert<T extends TenantCashbackConfigUpsertArgs>(args: SelectSubset<T, TenantCashbackConfigUpsertArgs<ExtArgs>>): Prisma__TenantCashbackConfigClient<$Result.GetResult<Prisma.$TenantCashbackConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantCashbackConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCashbackConfigCountArgs} args - Arguments to filter TenantCashbackConfigs to count.
     * @example
     * // Count the number of TenantCashbackConfigs
     * const count = await prisma.tenantCashbackConfig.count({
     *   where: {
     *     // ... the filter for the TenantCashbackConfigs we want to count
     *   }
     * })
    **/
    count<T extends TenantCashbackConfigCountArgs>(
      args?: Subset<T, TenantCashbackConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCashbackConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantCashbackConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCashbackConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantCashbackConfigAggregateArgs>(args: Subset<T, TenantCashbackConfigAggregateArgs>): Prisma.PrismaPromise<GetTenantCashbackConfigAggregateType<T>>

    /**
     * Group by TenantCashbackConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCashbackConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantCashbackConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantCashbackConfigGroupByArgs['orderBy'] }
        : { orderBy?: TenantCashbackConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantCashbackConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantCashbackConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantCashbackConfig model
   */
  readonly fields: TenantCashbackConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantCashbackConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantCashbackConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantCashbackConfig model
   */
  interface TenantCashbackConfigFieldRefs {
    readonly id: FieldRef<"TenantCashbackConfig", 'String'>
    readonly tenantId: FieldRef<"TenantCashbackConfig", 'String'>
    readonly consumerPercent: FieldRef<"TenantCashbackConfig", 'Decimal'>
    readonly clubPercent: FieldRef<"TenantCashbackConfig", 'Decimal'>
    readonly consumerReferrerPercent: FieldRef<"TenantCashbackConfig", 'Decimal'>
    readonly merchantReferrerPercent: FieldRef<"TenantCashbackConfig", 'Decimal'>
    readonly createdAt: FieldRef<"TenantCashbackConfig", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantCashbackConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantCashbackConfig findUnique
   */
  export type TenantCashbackConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter, which TenantCashbackConfig to fetch.
     */
    where: TenantCashbackConfigWhereUniqueInput
  }

  /**
   * TenantCashbackConfig findUniqueOrThrow
   */
  export type TenantCashbackConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter, which TenantCashbackConfig to fetch.
     */
    where: TenantCashbackConfigWhereUniqueInput
  }

  /**
   * TenantCashbackConfig findFirst
   */
  export type TenantCashbackConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter, which TenantCashbackConfig to fetch.
     */
    where?: TenantCashbackConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantCashbackConfigs to fetch.
     */
    orderBy?: TenantCashbackConfigOrderByWithRelationInput | TenantCashbackConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantCashbackConfigs.
     */
    cursor?: TenantCashbackConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantCashbackConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantCashbackConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantCashbackConfigs.
     */
    distinct?: TenantCashbackConfigScalarFieldEnum | TenantCashbackConfigScalarFieldEnum[]
  }

  /**
   * TenantCashbackConfig findFirstOrThrow
   */
  export type TenantCashbackConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter, which TenantCashbackConfig to fetch.
     */
    where?: TenantCashbackConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantCashbackConfigs to fetch.
     */
    orderBy?: TenantCashbackConfigOrderByWithRelationInput | TenantCashbackConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantCashbackConfigs.
     */
    cursor?: TenantCashbackConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantCashbackConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantCashbackConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantCashbackConfigs.
     */
    distinct?: TenantCashbackConfigScalarFieldEnum | TenantCashbackConfigScalarFieldEnum[]
  }

  /**
   * TenantCashbackConfig findMany
   */
  export type TenantCashbackConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter, which TenantCashbackConfigs to fetch.
     */
    where?: TenantCashbackConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantCashbackConfigs to fetch.
     */
    orderBy?: TenantCashbackConfigOrderByWithRelationInput | TenantCashbackConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantCashbackConfigs.
     */
    cursor?: TenantCashbackConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantCashbackConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantCashbackConfigs.
     */
    skip?: number
    distinct?: TenantCashbackConfigScalarFieldEnum | TenantCashbackConfigScalarFieldEnum[]
  }

  /**
   * TenantCashbackConfig create
   */
  export type TenantCashbackConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantCashbackConfig.
     */
    data: XOR<TenantCashbackConfigCreateInput, TenantCashbackConfigUncheckedCreateInput>
  }

  /**
   * TenantCashbackConfig createMany
   */
  export type TenantCashbackConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantCashbackConfigs.
     */
    data: TenantCashbackConfigCreateManyInput | TenantCashbackConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantCashbackConfig createManyAndReturn
   */
  export type TenantCashbackConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * The data used to create many TenantCashbackConfigs.
     */
    data: TenantCashbackConfigCreateManyInput | TenantCashbackConfigCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantCashbackConfig update
   */
  export type TenantCashbackConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantCashbackConfig.
     */
    data: XOR<TenantCashbackConfigUpdateInput, TenantCashbackConfigUncheckedUpdateInput>
    /**
     * Choose, which TenantCashbackConfig to update.
     */
    where: TenantCashbackConfigWhereUniqueInput
  }

  /**
   * TenantCashbackConfig updateMany
   */
  export type TenantCashbackConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantCashbackConfigs.
     */
    data: XOR<TenantCashbackConfigUpdateManyMutationInput, TenantCashbackConfigUncheckedUpdateManyInput>
    /**
     * Filter which TenantCashbackConfigs to update
     */
    where?: TenantCashbackConfigWhereInput
    /**
     * Limit how many TenantCashbackConfigs to update.
     */
    limit?: number
  }

  /**
   * TenantCashbackConfig updateManyAndReturn
   */
  export type TenantCashbackConfigUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * The data used to update TenantCashbackConfigs.
     */
    data: XOR<TenantCashbackConfigUpdateManyMutationInput, TenantCashbackConfigUncheckedUpdateManyInput>
    /**
     * Filter which TenantCashbackConfigs to update
     */
    where?: TenantCashbackConfigWhereInput
    /**
     * Limit how many TenantCashbackConfigs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantCashbackConfig upsert
   */
  export type TenantCashbackConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantCashbackConfig to update in case it exists.
     */
    where: TenantCashbackConfigWhereUniqueInput
    /**
     * In case the TenantCashbackConfig found by the `where` argument doesn't exist, create a new TenantCashbackConfig with this data.
     */
    create: XOR<TenantCashbackConfigCreateInput, TenantCashbackConfigUncheckedCreateInput>
    /**
     * In case the TenantCashbackConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantCashbackConfigUpdateInput, TenantCashbackConfigUncheckedUpdateInput>
  }

  /**
   * TenantCashbackConfig delete
   */
  export type TenantCashbackConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter which TenantCashbackConfig to delete.
     */
    where: TenantCashbackConfigWhereUniqueInput
  }

  /**
   * TenantCashbackConfig deleteMany
   */
  export type TenantCashbackConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantCashbackConfigs to delete
     */
    where?: TenantCashbackConfigWhereInput
    /**
     * Limit how many TenantCashbackConfigs to delete.
     */
    limit?: number
  }

  /**
   * TenantCashbackConfig without action
   */
  export type TenantCashbackConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCashbackConfig
     */
    select?: TenantCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantCashbackConfig
     */
    omit?: TenantCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantCashbackConfigInclude<ExtArgs> | null
  }


  /**
   * Model TenantWithdrawalConfig
   */

  export type AggregateTenantWithdrawalConfig = {
    _count: TenantWithdrawalConfigCountAggregateOutputType | null
    _avg: TenantWithdrawalConfigAvgAggregateOutputType | null
    _sum: TenantWithdrawalConfigSumAggregateOutputType | null
    _min: TenantWithdrawalConfigMinAggregateOutputType | null
    _max: TenantWithdrawalConfigMaxAggregateOutputType | null
  }

  export type TenantWithdrawalConfigAvgAggregateOutputType = {
    withdrawalFeePercent: Decimal | null
    withdrawalFeeFixed: Decimal | null
    minWithdrawalAmount: Decimal | null
  }

  export type TenantWithdrawalConfigSumAggregateOutputType = {
    withdrawalFeePercent: Decimal | null
    withdrawalFeeFixed: Decimal | null
    minWithdrawalAmount: Decimal | null
  }

  export type TenantWithdrawalConfigMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    withdrawalFeePercent: Decimal | null
    withdrawalFeeFixed: Decimal | null
    minWithdrawalAmount: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantWithdrawalConfigMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    withdrawalFeePercent: Decimal | null
    withdrawalFeeFixed: Decimal | null
    minWithdrawalAmount: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantWithdrawalConfigCountAggregateOutputType = {
    id: number
    tenantId: number
    withdrawalFeePercent: number
    withdrawalFeeFixed: number
    minWithdrawalAmount: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantWithdrawalConfigAvgAggregateInputType = {
    withdrawalFeePercent?: true
    withdrawalFeeFixed?: true
    minWithdrawalAmount?: true
  }

  export type TenantWithdrawalConfigSumAggregateInputType = {
    withdrawalFeePercent?: true
    withdrawalFeeFixed?: true
    minWithdrawalAmount?: true
  }

  export type TenantWithdrawalConfigMinAggregateInputType = {
    id?: true
    tenantId?: true
    withdrawalFeePercent?: true
    withdrawalFeeFixed?: true
    minWithdrawalAmount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantWithdrawalConfigMaxAggregateInputType = {
    id?: true
    tenantId?: true
    withdrawalFeePercent?: true
    withdrawalFeeFixed?: true
    minWithdrawalAmount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantWithdrawalConfigCountAggregateInputType = {
    id?: true
    tenantId?: true
    withdrawalFeePercent?: true
    withdrawalFeeFixed?: true
    minWithdrawalAmount?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantWithdrawalConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantWithdrawalConfig to aggregate.
     */
    where?: TenantWithdrawalConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantWithdrawalConfigs to fetch.
     */
    orderBy?: TenantWithdrawalConfigOrderByWithRelationInput | TenantWithdrawalConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWithdrawalConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantWithdrawalConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantWithdrawalConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantWithdrawalConfigs
    **/
    _count?: true | TenantWithdrawalConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TenantWithdrawalConfigAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TenantWithdrawalConfigSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantWithdrawalConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantWithdrawalConfigMaxAggregateInputType
  }

  export type GetTenantWithdrawalConfigAggregateType<T extends TenantWithdrawalConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantWithdrawalConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantWithdrawalConfig[P]>
      : GetScalarType<T[P], AggregateTenantWithdrawalConfig[P]>
  }




  export type TenantWithdrawalConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWithdrawalConfigWhereInput
    orderBy?: TenantWithdrawalConfigOrderByWithAggregationInput | TenantWithdrawalConfigOrderByWithAggregationInput[]
    by: TenantWithdrawalConfigScalarFieldEnum[] | TenantWithdrawalConfigScalarFieldEnum
    having?: TenantWithdrawalConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantWithdrawalConfigCountAggregateInputType | true
    _avg?: TenantWithdrawalConfigAvgAggregateInputType
    _sum?: TenantWithdrawalConfigSumAggregateInputType
    _min?: TenantWithdrawalConfigMinAggregateInputType
    _max?: TenantWithdrawalConfigMaxAggregateInputType
  }

  export type TenantWithdrawalConfigGroupByOutputType = {
    id: string
    tenantId: string
    withdrawalFeePercent: Decimal
    withdrawalFeeFixed: Decimal
    minWithdrawalAmount: Decimal
    createdAt: Date
    updatedAt: Date
    _count: TenantWithdrawalConfigCountAggregateOutputType | null
    _avg: TenantWithdrawalConfigAvgAggregateOutputType | null
    _sum: TenantWithdrawalConfigSumAggregateOutputType | null
    _min: TenantWithdrawalConfigMinAggregateOutputType | null
    _max: TenantWithdrawalConfigMaxAggregateOutputType | null
  }

  type GetTenantWithdrawalConfigGroupByPayload<T extends TenantWithdrawalConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantWithdrawalConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantWithdrawalConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantWithdrawalConfigGroupByOutputType[P]>
            : GetScalarType<T[P], TenantWithdrawalConfigGroupByOutputType[P]>
        }
      >
    >


  export type TenantWithdrawalConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    withdrawalFeePercent?: boolean
    withdrawalFeeFixed?: boolean
    minWithdrawalAmount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantWithdrawalConfig"]>

  export type TenantWithdrawalConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    withdrawalFeePercent?: boolean
    withdrawalFeeFixed?: boolean
    minWithdrawalAmount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantWithdrawalConfig"]>

  export type TenantWithdrawalConfigSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    withdrawalFeePercent?: boolean
    withdrawalFeeFixed?: boolean
    minWithdrawalAmount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantWithdrawalConfig"]>

  export type TenantWithdrawalConfigSelectScalar = {
    id?: boolean
    tenantId?: boolean
    withdrawalFeePercent?: boolean
    withdrawalFeeFixed?: boolean
    minWithdrawalAmount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantWithdrawalConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "withdrawalFeePercent" | "withdrawalFeeFixed" | "minWithdrawalAmount" | "createdAt" | "updatedAt", ExtArgs["result"]["tenantWithdrawalConfig"]>
  export type TenantWithdrawalConfigInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantWithdrawalConfigIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantWithdrawalConfigIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $TenantWithdrawalConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantWithdrawalConfig"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      withdrawalFeePercent: Prisma.Decimal
      withdrawalFeeFixed: Prisma.Decimal
      minWithdrawalAmount: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantWithdrawalConfig"]>
    composites: {}
  }

  type TenantWithdrawalConfigGetPayload<S extends boolean | null | undefined | TenantWithdrawalConfigDefaultArgs> = $Result.GetResult<Prisma.$TenantWithdrawalConfigPayload, S>

  type TenantWithdrawalConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantWithdrawalConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantWithdrawalConfigCountAggregateInputType | true
    }

  export interface TenantWithdrawalConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantWithdrawalConfig'], meta: { name: 'TenantWithdrawalConfig' } }
    /**
     * Find zero or one TenantWithdrawalConfig that matches the filter.
     * @param {TenantWithdrawalConfigFindUniqueArgs} args - Arguments to find a TenantWithdrawalConfig
     * @example
     * // Get one TenantWithdrawalConfig
     * const tenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantWithdrawalConfigFindUniqueArgs>(args: SelectSubset<T, TenantWithdrawalConfigFindUniqueArgs<ExtArgs>>): Prisma__TenantWithdrawalConfigClient<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantWithdrawalConfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantWithdrawalConfigFindUniqueOrThrowArgs} args - Arguments to find a TenantWithdrawalConfig
     * @example
     * // Get one TenantWithdrawalConfig
     * const tenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantWithdrawalConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantWithdrawalConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantWithdrawalConfigClient<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantWithdrawalConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantWithdrawalConfigFindFirstArgs} args - Arguments to find a TenantWithdrawalConfig
     * @example
     * // Get one TenantWithdrawalConfig
     * const tenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantWithdrawalConfigFindFirstArgs>(args?: SelectSubset<T, TenantWithdrawalConfigFindFirstArgs<ExtArgs>>): Prisma__TenantWithdrawalConfigClient<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantWithdrawalConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantWithdrawalConfigFindFirstOrThrowArgs} args - Arguments to find a TenantWithdrawalConfig
     * @example
     * // Get one TenantWithdrawalConfig
     * const tenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantWithdrawalConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantWithdrawalConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantWithdrawalConfigClient<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantWithdrawalConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantWithdrawalConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantWithdrawalConfigs
     * const tenantWithdrawalConfigs = await prisma.tenantWithdrawalConfig.findMany()
     * 
     * // Get first 10 TenantWithdrawalConfigs
     * const tenantWithdrawalConfigs = await prisma.tenantWithdrawalConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithdrawalConfigWithIdOnly = await prisma.tenantWithdrawalConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantWithdrawalConfigFindManyArgs>(args?: SelectSubset<T, TenantWithdrawalConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantWithdrawalConfig.
     * @param {TenantWithdrawalConfigCreateArgs} args - Arguments to create a TenantWithdrawalConfig.
     * @example
     * // Create one TenantWithdrawalConfig
     * const TenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.create({
     *   data: {
     *     // ... data to create a TenantWithdrawalConfig
     *   }
     * })
     * 
     */
    create<T extends TenantWithdrawalConfigCreateArgs>(args: SelectSubset<T, TenantWithdrawalConfigCreateArgs<ExtArgs>>): Prisma__TenantWithdrawalConfigClient<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantWithdrawalConfigs.
     * @param {TenantWithdrawalConfigCreateManyArgs} args - Arguments to create many TenantWithdrawalConfigs.
     * @example
     * // Create many TenantWithdrawalConfigs
     * const tenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantWithdrawalConfigCreateManyArgs>(args?: SelectSubset<T, TenantWithdrawalConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantWithdrawalConfigs and returns the data saved in the database.
     * @param {TenantWithdrawalConfigCreateManyAndReturnArgs} args - Arguments to create many TenantWithdrawalConfigs.
     * @example
     * // Create many TenantWithdrawalConfigs
     * const tenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantWithdrawalConfigs and only return the `id`
     * const tenantWithdrawalConfigWithIdOnly = await prisma.tenantWithdrawalConfig.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantWithdrawalConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantWithdrawalConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantWithdrawalConfig.
     * @param {TenantWithdrawalConfigDeleteArgs} args - Arguments to delete one TenantWithdrawalConfig.
     * @example
     * // Delete one TenantWithdrawalConfig
     * const TenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.delete({
     *   where: {
     *     // ... filter to delete one TenantWithdrawalConfig
     *   }
     * })
     * 
     */
    delete<T extends TenantWithdrawalConfigDeleteArgs>(args: SelectSubset<T, TenantWithdrawalConfigDeleteArgs<ExtArgs>>): Prisma__TenantWithdrawalConfigClient<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantWithdrawalConfig.
     * @param {TenantWithdrawalConfigUpdateArgs} args - Arguments to update one TenantWithdrawalConfig.
     * @example
     * // Update one TenantWithdrawalConfig
     * const tenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantWithdrawalConfigUpdateArgs>(args: SelectSubset<T, TenantWithdrawalConfigUpdateArgs<ExtArgs>>): Prisma__TenantWithdrawalConfigClient<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantWithdrawalConfigs.
     * @param {TenantWithdrawalConfigDeleteManyArgs} args - Arguments to filter TenantWithdrawalConfigs to delete.
     * @example
     * // Delete a few TenantWithdrawalConfigs
     * const { count } = await prisma.tenantWithdrawalConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantWithdrawalConfigDeleteManyArgs>(args?: SelectSubset<T, TenantWithdrawalConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantWithdrawalConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantWithdrawalConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantWithdrawalConfigs
     * const tenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantWithdrawalConfigUpdateManyArgs>(args: SelectSubset<T, TenantWithdrawalConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantWithdrawalConfigs and returns the data updated in the database.
     * @param {TenantWithdrawalConfigUpdateManyAndReturnArgs} args - Arguments to update many TenantWithdrawalConfigs.
     * @example
     * // Update many TenantWithdrawalConfigs
     * const tenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantWithdrawalConfigs and only return the `id`
     * const tenantWithdrawalConfigWithIdOnly = await prisma.tenantWithdrawalConfig.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantWithdrawalConfigUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantWithdrawalConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantWithdrawalConfig.
     * @param {TenantWithdrawalConfigUpsertArgs} args - Arguments to update or create a TenantWithdrawalConfig.
     * @example
     * // Update or create a TenantWithdrawalConfig
     * const tenantWithdrawalConfig = await prisma.tenantWithdrawalConfig.upsert({
     *   create: {
     *     // ... data to create a TenantWithdrawalConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantWithdrawalConfig we want to update
     *   }
     * })
     */
    upsert<T extends TenantWithdrawalConfigUpsertArgs>(args: SelectSubset<T, TenantWithdrawalConfigUpsertArgs<ExtArgs>>): Prisma__TenantWithdrawalConfigClient<$Result.GetResult<Prisma.$TenantWithdrawalConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantWithdrawalConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantWithdrawalConfigCountArgs} args - Arguments to filter TenantWithdrawalConfigs to count.
     * @example
     * // Count the number of TenantWithdrawalConfigs
     * const count = await prisma.tenantWithdrawalConfig.count({
     *   where: {
     *     // ... the filter for the TenantWithdrawalConfigs we want to count
     *   }
     * })
    **/
    count<T extends TenantWithdrawalConfigCountArgs>(
      args?: Subset<T, TenantWithdrawalConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantWithdrawalConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantWithdrawalConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantWithdrawalConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantWithdrawalConfigAggregateArgs>(args: Subset<T, TenantWithdrawalConfigAggregateArgs>): Prisma.PrismaPromise<GetTenantWithdrawalConfigAggregateType<T>>

    /**
     * Group by TenantWithdrawalConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantWithdrawalConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantWithdrawalConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantWithdrawalConfigGroupByArgs['orderBy'] }
        : { orderBy?: TenantWithdrawalConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantWithdrawalConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantWithdrawalConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantWithdrawalConfig model
   */
  readonly fields: TenantWithdrawalConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantWithdrawalConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantWithdrawalConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantWithdrawalConfig model
   */
  interface TenantWithdrawalConfigFieldRefs {
    readonly id: FieldRef<"TenantWithdrawalConfig", 'String'>
    readonly tenantId: FieldRef<"TenantWithdrawalConfig", 'String'>
    readonly withdrawalFeePercent: FieldRef<"TenantWithdrawalConfig", 'Decimal'>
    readonly withdrawalFeeFixed: FieldRef<"TenantWithdrawalConfig", 'Decimal'>
    readonly minWithdrawalAmount: FieldRef<"TenantWithdrawalConfig", 'Decimal'>
    readonly createdAt: FieldRef<"TenantWithdrawalConfig", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantWithdrawalConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantWithdrawalConfig findUnique
   */
  export type TenantWithdrawalConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigInclude<ExtArgs> | null
    /**
     * Filter, which TenantWithdrawalConfig to fetch.
     */
    where: TenantWithdrawalConfigWhereUniqueInput
  }

  /**
   * TenantWithdrawalConfig findUniqueOrThrow
   */
  export type TenantWithdrawalConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigInclude<ExtArgs> | null
    /**
     * Filter, which TenantWithdrawalConfig to fetch.
     */
    where: TenantWithdrawalConfigWhereUniqueInput
  }

  /**
   * TenantWithdrawalConfig findFirst
   */
  export type TenantWithdrawalConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigInclude<ExtArgs> | null
    /**
     * Filter, which TenantWithdrawalConfig to fetch.
     */
    where?: TenantWithdrawalConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantWithdrawalConfigs to fetch.
     */
    orderBy?: TenantWithdrawalConfigOrderByWithRelationInput | TenantWithdrawalConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantWithdrawalConfigs.
     */
    cursor?: TenantWithdrawalConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantWithdrawalConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantWithdrawalConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantWithdrawalConfigs.
     */
    distinct?: TenantWithdrawalConfigScalarFieldEnum | TenantWithdrawalConfigScalarFieldEnum[]
  }

  /**
   * TenantWithdrawalConfig findFirstOrThrow
   */
  export type TenantWithdrawalConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigInclude<ExtArgs> | null
    /**
     * Filter, which TenantWithdrawalConfig to fetch.
     */
    where?: TenantWithdrawalConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantWithdrawalConfigs to fetch.
     */
    orderBy?: TenantWithdrawalConfigOrderByWithRelationInput | TenantWithdrawalConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantWithdrawalConfigs.
     */
    cursor?: TenantWithdrawalConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantWithdrawalConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantWithdrawalConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantWithdrawalConfigs.
     */
    distinct?: TenantWithdrawalConfigScalarFieldEnum | TenantWithdrawalConfigScalarFieldEnum[]
  }

  /**
   * TenantWithdrawalConfig findMany
   */
  export type TenantWithdrawalConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigInclude<ExtArgs> | null
    /**
     * Filter, which TenantWithdrawalConfigs to fetch.
     */
    where?: TenantWithdrawalConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantWithdrawalConfigs to fetch.
     */
    orderBy?: TenantWithdrawalConfigOrderByWithRelationInput | TenantWithdrawalConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantWithdrawalConfigs.
     */
    cursor?: TenantWithdrawalConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantWithdrawalConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantWithdrawalConfigs.
     */
    skip?: number
    distinct?: TenantWithdrawalConfigScalarFieldEnum | TenantWithdrawalConfigScalarFieldEnum[]
  }

  /**
   * TenantWithdrawalConfig create
   */
  export type TenantWithdrawalConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantWithdrawalConfig.
     */
    data: XOR<TenantWithdrawalConfigCreateInput, TenantWithdrawalConfigUncheckedCreateInput>
  }

  /**
   * TenantWithdrawalConfig createMany
   */
  export type TenantWithdrawalConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantWithdrawalConfigs.
     */
    data: TenantWithdrawalConfigCreateManyInput | TenantWithdrawalConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantWithdrawalConfig createManyAndReturn
   */
  export type TenantWithdrawalConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * The data used to create many TenantWithdrawalConfigs.
     */
    data: TenantWithdrawalConfigCreateManyInput | TenantWithdrawalConfigCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantWithdrawalConfig update
   */
  export type TenantWithdrawalConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantWithdrawalConfig.
     */
    data: XOR<TenantWithdrawalConfigUpdateInput, TenantWithdrawalConfigUncheckedUpdateInput>
    /**
     * Choose, which TenantWithdrawalConfig to update.
     */
    where: TenantWithdrawalConfigWhereUniqueInput
  }

  /**
   * TenantWithdrawalConfig updateMany
   */
  export type TenantWithdrawalConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantWithdrawalConfigs.
     */
    data: XOR<TenantWithdrawalConfigUpdateManyMutationInput, TenantWithdrawalConfigUncheckedUpdateManyInput>
    /**
     * Filter which TenantWithdrawalConfigs to update
     */
    where?: TenantWithdrawalConfigWhereInput
    /**
     * Limit how many TenantWithdrawalConfigs to update.
     */
    limit?: number
  }

  /**
   * TenantWithdrawalConfig updateManyAndReturn
   */
  export type TenantWithdrawalConfigUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * The data used to update TenantWithdrawalConfigs.
     */
    data: XOR<TenantWithdrawalConfigUpdateManyMutationInput, TenantWithdrawalConfigUncheckedUpdateManyInput>
    /**
     * Filter which TenantWithdrawalConfigs to update
     */
    where?: TenantWithdrawalConfigWhereInput
    /**
     * Limit how many TenantWithdrawalConfigs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantWithdrawalConfig upsert
   */
  export type TenantWithdrawalConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantWithdrawalConfig to update in case it exists.
     */
    where: TenantWithdrawalConfigWhereUniqueInput
    /**
     * In case the TenantWithdrawalConfig found by the `where` argument doesn't exist, create a new TenantWithdrawalConfig with this data.
     */
    create: XOR<TenantWithdrawalConfigCreateInput, TenantWithdrawalConfigUncheckedCreateInput>
    /**
     * In case the TenantWithdrawalConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantWithdrawalConfigUpdateInput, TenantWithdrawalConfigUncheckedUpdateInput>
  }

  /**
   * TenantWithdrawalConfig delete
   */
  export type TenantWithdrawalConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigInclude<ExtArgs> | null
    /**
     * Filter which TenantWithdrawalConfig to delete.
     */
    where: TenantWithdrawalConfigWhereUniqueInput
  }

  /**
   * TenantWithdrawalConfig deleteMany
   */
  export type TenantWithdrawalConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantWithdrawalConfigs to delete
     */
    where?: TenantWithdrawalConfigWhereInput
    /**
     * Limit how many TenantWithdrawalConfigs to delete.
     */
    limit?: number
  }

  /**
   * TenantWithdrawalConfig without action
   */
  export type TenantWithdrawalConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantWithdrawalConfig
     */
    select?: TenantWithdrawalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantWithdrawalConfig
     */
    omit?: TenantWithdrawalConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantWithdrawalConfigInclude<ExtArgs> | null
  }


  /**
   * Model TenantAdmin
   */

  export type AggregateTenantAdmin = {
    _count: TenantAdminCountAggregateOutputType | null
    _min: TenantAdminMinAggregateOutputType | null
    _max: TenantAdminMaxAggregateOutputType | null
  }

  export type TenantAdminMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    email: string | null
    password: string | null
    role: $Enums.AdminRole | null
    isActive: boolean | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantAdminMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    email: string | null
    password: string | null
    role: $Enums.AdminRole | null
    isActive: boolean | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantAdminCountAggregateOutputType = {
    id: number
    tenantId: number
    name: number
    email: number
    password: number
    role: number
    isActive: number
    lastLoginAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantAdminMinAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantAdminMaxAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantAdminCountAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantAdminAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantAdmin to aggregate.
     */
    where?: TenantAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAdmins to fetch.
     */
    orderBy?: TenantAdminOrderByWithRelationInput | TenantAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantAdmins
    **/
    _count?: true | TenantAdminCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantAdminMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantAdminMaxAggregateInputType
  }

  export type GetTenantAdminAggregateType<T extends TenantAdminAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantAdmin]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantAdmin[P]>
      : GetScalarType<T[P], AggregateTenantAdmin[P]>
  }




  export type TenantAdminGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantAdminWhereInput
    orderBy?: TenantAdminOrderByWithAggregationInput | TenantAdminOrderByWithAggregationInput[]
    by: TenantAdminScalarFieldEnum[] | TenantAdminScalarFieldEnum
    having?: TenantAdminScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantAdminCountAggregateInputType | true
    _min?: TenantAdminMinAggregateInputType
    _max?: TenantAdminMaxAggregateInputType
  }

  export type TenantAdminGroupByOutputType = {
    id: string
    tenantId: string
    name: string
    email: string
    password: string
    role: $Enums.AdminRole
    isActive: boolean
    lastLoginAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: TenantAdminCountAggregateOutputType | null
    _min: TenantAdminMinAggregateOutputType | null
    _max: TenantAdminMaxAggregateOutputType | null
  }

  type GetTenantAdminGroupByPayload<T extends TenantAdminGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantAdminGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantAdminGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantAdminGroupByOutputType[P]>
            : GetScalarType<T[P], TenantAdminGroupByOutputType[P]>
        }
      >
    >


  export type TenantAdminSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantAdmin"]>

  export type TenantAdminSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantAdmin"]>

  export type TenantAdminSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantAdmin"]>

  export type TenantAdminSelectScalar = {
    id?: boolean
    tenantId?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantAdminOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "name" | "email" | "password" | "role" | "isActive" | "lastLoginAt" | "createdAt" | "updatedAt", ExtArgs["result"]["tenantAdmin"]>
  export type TenantAdminInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantAdminIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantAdminIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $TenantAdminPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantAdmin"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      name: string
      email: string
      password: string
      role: $Enums.AdminRole
      isActive: boolean
      lastLoginAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantAdmin"]>
    composites: {}
  }

  type TenantAdminGetPayload<S extends boolean | null | undefined | TenantAdminDefaultArgs> = $Result.GetResult<Prisma.$TenantAdminPayload, S>

  type TenantAdminCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantAdminFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantAdminCountAggregateInputType | true
    }

  export interface TenantAdminDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantAdmin'], meta: { name: 'TenantAdmin' } }
    /**
     * Find zero or one TenantAdmin that matches the filter.
     * @param {TenantAdminFindUniqueArgs} args - Arguments to find a TenantAdmin
     * @example
     * // Get one TenantAdmin
     * const tenantAdmin = await prisma.tenantAdmin.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantAdminFindUniqueArgs>(args: SelectSubset<T, TenantAdminFindUniqueArgs<ExtArgs>>): Prisma__TenantAdminClient<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantAdmin that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantAdminFindUniqueOrThrowArgs} args - Arguments to find a TenantAdmin
     * @example
     * // Get one TenantAdmin
     * const tenantAdmin = await prisma.tenantAdmin.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantAdminFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantAdminFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantAdminClient<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantAdmin that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAdminFindFirstArgs} args - Arguments to find a TenantAdmin
     * @example
     * // Get one TenantAdmin
     * const tenantAdmin = await prisma.tenantAdmin.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantAdminFindFirstArgs>(args?: SelectSubset<T, TenantAdminFindFirstArgs<ExtArgs>>): Prisma__TenantAdminClient<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantAdmin that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAdminFindFirstOrThrowArgs} args - Arguments to find a TenantAdmin
     * @example
     * // Get one TenantAdmin
     * const tenantAdmin = await prisma.tenantAdmin.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantAdminFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantAdminFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantAdminClient<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantAdmins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAdminFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantAdmins
     * const tenantAdmins = await prisma.tenantAdmin.findMany()
     * 
     * // Get first 10 TenantAdmins
     * const tenantAdmins = await prisma.tenantAdmin.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantAdminWithIdOnly = await prisma.tenantAdmin.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantAdminFindManyArgs>(args?: SelectSubset<T, TenantAdminFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantAdmin.
     * @param {TenantAdminCreateArgs} args - Arguments to create a TenantAdmin.
     * @example
     * // Create one TenantAdmin
     * const TenantAdmin = await prisma.tenantAdmin.create({
     *   data: {
     *     // ... data to create a TenantAdmin
     *   }
     * })
     * 
     */
    create<T extends TenantAdminCreateArgs>(args: SelectSubset<T, TenantAdminCreateArgs<ExtArgs>>): Prisma__TenantAdminClient<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantAdmins.
     * @param {TenantAdminCreateManyArgs} args - Arguments to create many TenantAdmins.
     * @example
     * // Create many TenantAdmins
     * const tenantAdmin = await prisma.tenantAdmin.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantAdminCreateManyArgs>(args?: SelectSubset<T, TenantAdminCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantAdmins and returns the data saved in the database.
     * @param {TenantAdminCreateManyAndReturnArgs} args - Arguments to create many TenantAdmins.
     * @example
     * // Create many TenantAdmins
     * const tenantAdmin = await prisma.tenantAdmin.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantAdmins and only return the `id`
     * const tenantAdminWithIdOnly = await prisma.tenantAdmin.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantAdminCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantAdminCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantAdmin.
     * @param {TenantAdminDeleteArgs} args - Arguments to delete one TenantAdmin.
     * @example
     * // Delete one TenantAdmin
     * const TenantAdmin = await prisma.tenantAdmin.delete({
     *   where: {
     *     // ... filter to delete one TenantAdmin
     *   }
     * })
     * 
     */
    delete<T extends TenantAdminDeleteArgs>(args: SelectSubset<T, TenantAdminDeleteArgs<ExtArgs>>): Prisma__TenantAdminClient<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantAdmin.
     * @param {TenantAdminUpdateArgs} args - Arguments to update one TenantAdmin.
     * @example
     * // Update one TenantAdmin
     * const tenantAdmin = await prisma.tenantAdmin.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantAdminUpdateArgs>(args: SelectSubset<T, TenantAdminUpdateArgs<ExtArgs>>): Prisma__TenantAdminClient<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantAdmins.
     * @param {TenantAdminDeleteManyArgs} args - Arguments to filter TenantAdmins to delete.
     * @example
     * // Delete a few TenantAdmins
     * const { count } = await prisma.tenantAdmin.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantAdminDeleteManyArgs>(args?: SelectSubset<T, TenantAdminDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAdminUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantAdmins
     * const tenantAdmin = await prisma.tenantAdmin.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantAdminUpdateManyArgs>(args: SelectSubset<T, TenantAdminUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantAdmins and returns the data updated in the database.
     * @param {TenantAdminUpdateManyAndReturnArgs} args - Arguments to update many TenantAdmins.
     * @example
     * // Update many TenantAdmins
     * const tenantAdmin = await prisma.tenantAdmin.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantAdmins and only return the `id`
     * const tenantAdminWithIdOnly = await prisma.tenantAdmin.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantAdminUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantAdminUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantAdmin.
     * @param {TenantAdminUpsertArgs} args - Arguments to update or create a TenantAdmin.
     * @example
     * // Update or create a TenantAdmin
     * const tenantAdmin = await prisma.tenantAdmin.upsert({
     *   create: {
     *     // ... data to create a TenantAdmin
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantAdmin we want to update
     *   }
     * })
     */
    upsert<T extends TenantAdminUpsertArgs>(args: SelectSubset<T, TenantAdminUpsertArgs<ExtArgs>>): Prisma__TenantAdminClient<$Result.GetResult<Prisma.$TenantAdminPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAdminCountArgs} args - Arguments to filter TenantAdmins to count.
     * @example
     * // Count the number of TenantAdmins
     * const count = await prisma.tenantAdmin.count({
     *   where: {
     *     // ... the filter for the TenantAdmins we want to count
     *   }
     * })
    **/
    count<T extends TenantAdminCountArgs>(
      args?: Subset<T, TenantAdminCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantAdminCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAdminAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantAdminAggregateArgs>(args: Subset<T, TenantAdminAggregateArgs>): Prisma.PrismaPromise<GetTenantAdminAggregateType<T>>

    /**
     * Group by TenantAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAdminGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantAdminGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantAdminGroupByArgs['orderBy'] }
        : { orderBy?: TenantAdminGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantAdminGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantAdminGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantAdmin model
   */
  readonly fields: TenantAdminFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantAdmin.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantAdminClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantAdmin model
   */
  interface TenantAdminFieldRefs {
    readonly id: FieldRef<"TenantAdmin", 'String'>
    readonly tenantId: FieldRef<"TenantAdmin", 'String'>
    readonly name: FieldRef<"TenantAdmin", 'String'>
    readonly email: FieldRef<"TenantAdmin", 'String'>
    readonly password: FieldRef<"TenantAdmin", 'String'>
    readonly role: FieldRef<"TenantAdmin", 'AdminRole'>
    readonly isActive: FieldRef<"TenantAdmin", 'Boolean'>
    readonly lastLoginAt: FieldRef<"TenantAdmin", 'DateTime'>
    readonly createdAt: FieldRef<"TenantAdmin", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantAdmin", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantAdmin findUnique
   */
  export type TenantAdminFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminInclude<ExtArgs> | null
    /**
     * Filter, which TenantAdmin to fetch.
     */
    where: TenantAdminWhereUniqueInput
  }

  /**
   * TenantAdmin findUniqueOrThrow
   */
  export type TenantAdminFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminInclude<ExtArgs> | null
    /**
     * Filter, which TenantAdmin to fetch.
     */
    where: TenantAdminWhereUniqueInput
  }

  /**
   * TenantAdmin findFirst
   */
  export type TenantAdminFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminInclude<ExtArgs> | null
    /**
     * Filter, which TenantAdmin to fetch.
     */
    where?: TenantAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAdmins to fetch.
     */
    orderBy?: TenantAdminOrderByWithRelationInput | TenantAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantAdmins.
     */
    cursor?: TenantAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantAdmins.
     */
    distinct?: TenantAdminScalarFieldEnum | TenantAdminScalarFieldEnum[]
  }

  /**
   * TenantAdmin findFirstOrThrow
   */
  export type TenantAdminFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminInclude<ExtArgs> | null
    /**
     * Filter, which TenantAdmin to fetch.
     */
    where?: TenantAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAdmins to fetch.
     */
    orderBy?: TenantAdminOrderByWithRelationInput | TenantAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantAdmins.
     */
    cursor?: TenantAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantAdmins.
     */
    distinct?: TenantAdminScalarFieldEnum | TenantAdminScalarFieldEnum[]
  }

  /**
   * TenantAdmin findMany
   */
  export type TenantAdminFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminInclude<ExtArgs> | null
    /**
     * Filter, which TenantAdmins to fetch.
     */
    where?: TenantAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantAdmins to fetch.
     */
    orderBy?: TenantAdminOrderByWithRelationInput | TenantAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantAdmins.
     */
    cursor?: TenantAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantAdmins.
     */
    skip?: number
    distinct?: TenantAdminScalarFieldEnum | TenantAdminScalarFieldEnum[]
  }

  /**
   * TenantAdmin create
   */
  export type TenantAdminCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantAdmin.
     */
    data: XOR<TenantAdminCreateInput, TenantAdminUncheckedCreateInput>
  }

  /**
   * TenantAdmin createMany
   */
  export type TenantAdminCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantAdmins.
     */
    data: TenantAdminCreateManyInput | TenantAdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantAdmin createManyAndReturn
   */
  export type TenantAdminCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * The data used to create many TenantAdmins.
     */
    data: TenantAdminCreateManyInput | TenantAdminCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantAdmin update
   */
  export type TenantAdminUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantAdmin.
     */
    data: XOR<TenantAdminUpdateInput, TenantAdminUncheckedUpdateInput>
    /**
     * Choose, which TenantAdmin to update.
     */
    where: TenantAdminWhereUniqueInput
  }

  /**
   * TenantAdmin updateMany
   */
  export type TenantAdminUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantAdmins.
     */
    data: XOR<TenantAdminUpdateManyMutationInput, TenantAdminUncheckedUpdateManyInput>
    /**
     * Filter which TenantAdmins to update
     */
    where?: TenantAdminWhereInput
    /**
     * Limit how many TenantAdmins to update.
     */
    limit?: number
  }

  /**
   * TenantAdmin updateManyAndReturn
   */
  export type TenantAdminUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * The data used to update TenantAdmins.
     */
    data: XOR<TenantAdminUpdateManyMutationInput, TenantAdminUncheckedUpdateManyInput>
    /**
     * Filter which TenantAdmins to update
     */
    where?: TenantAdminWhereInput
    /**
     * Limit how many TenantAdmins to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantAdmin upsert
   */
  export type TenantAdminUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantAdmin to update in case it exists.
     */
    where: TenantAdminWhereUniqueInput
    /**
     * In case the TenantAdmin found by the `where` argument doesn't exist, create a new TenantAdmin with this data.
     */
    create: XOR<TenantAdminCreateInput, TenantAdminUncheckedCreateInput>
    /**
     * In case the TenantAdmin was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantAdminUpdateInput, TenantAdminUncheckedUpdateInput>
  }

  /**
   * TenantAdmin delete
   */
  export type TenantAdminDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminInclude<ExtArgs> | null
    /**
     * Filter which TenantAdmin to delete.
     */
    where: TenantAdminWhereUniqueInput
  }

  /**
   * TenantAdmin deleteMany
   */
  export type TenantAdminDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantAdmins to delete
     */
    where?: TenantAdminWhereInput
    /**
     * Limit how many TenantAdmins to delete.
     */
    limit?: number
  }

  /**
   * TenantAdmin without action
   */
  export type TenantAdminDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantAdmin
     */
    select?: TenantAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantAdmin
     */
    omit?: TenantAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantAdminInclude<ExtArgs> | null
  }


  /**
   * Model SuperAdmin
   */

  export type AggregateSuperAdmin = {
    _count: SuperAdminCountAggregateOutputType | null
    _min: SuperAdminMinAggregateOutputType | null
    _max: SuperAdminMaxAggregateOutputType | null
  }

  export type SuperAdminMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    isActive: boolean | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SuperAdminMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    isActive: boolean | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SuperAdminCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    permissions: number
    isActive: number
    lastLoginAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SuperAdminMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SuperAdminMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SuperAdminCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    permissions?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SuperAdminAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SuperAdmin to aggregate.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SuperAdmins
    **/
    _count?: true | SuperAdminCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SuperAdminMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SuperAdminMaxAggregateInputType
  }

  export type GetSuperAdminAggregateType<T extends SuperAdminAggregateArgs> = {
        [P in keyof T & keyof AggregateSuperAdmin]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSuperAdmin[P]>
      : GetScalarType<T[P], AggregateSuperAdmin[P]>
  }




  export type SuperAdminGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SuperAdminWhereInput
    orderBy?: SuperAdminOrderByWithAggregationInput | SuperAdminOrderByWithAggregationInput[]
    by: SuperAdminScalarFieldEnum[] | SuperAdminScalarFieldEnum
    having?: SuperAdminScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SuperAdminCountAggregateInputType | true
    _min?: SuperAdminMinAggregateInputType
    _max?: SuperAdminMaxAggregateInputType
  }

  export type SuperAdminGroupByOutputType = {
    id: string
    name: string
    email: string
    password: string
    permissions: JsonValue
    isActive: boolean
    lastLoginAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: SuperAdminCountAggregateOutputType | null
    _min: SuperAdminMinAggregateOutputType | null
    _max: SuperAdminMaxAggregateOutputType | null
  }

  type GetSuperAdminGroupByPayload<T extends SuperAdminGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SuperAdminGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SuperAdminGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SuperAdminGroupByOutputType[P]>
            : GetScalarType<T[P], SuperAdminGroupByOutputType[P]>
        }
      >
    >


  export type SuperAdminSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    permissions?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    permissions?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    permissions?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    permissions?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SuperAdminOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "password" | "permissions" | "isActive" | "lastLoginAt" | "createdAt" | "updatedAt", ExtArgs["result"]["superAdmin"]>

  export type $SuperAdminPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SuperAdmin"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      password: string
      permissions: Prisma.JsonValue
      isActive: boolean
      lastLoginAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["superAdmin"]>
    composites: {}
  }

  type SuperAdminGetPayload<S extends boolean | null | undefined | SuperAdminDefaultArgs> = $Result.GetResult<Prisma.$SuperAdminPayload, S>

  type SuperAdminCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SuperAdminFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SuperAdminCountAggregateInputType | true
    }

  export interface SuperAdminDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SuperAdmin'], meta: { name: 'SuperAdmin' } }
    /**
     * Find zero or one SuperAdmin that matches the filter.
     * @param {SuperAdminFindUniqueArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SuperAdminFindUniqueArgs>(args: SelectSubset<T, SuperAdminFindUniqueArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SuperAdmin that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SuperAdminFindUniqueOrThrowArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SuperAdminFindUniqueOrThrowArgs>(args: SelectSubset<T, SuperAdminFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SuperAdmin that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindFirstArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SuperAdminFindFirstArgs>(args?: SelectSubset<T, SuperAdminFindFirstArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SuperAdmin that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindFirstOrThrowArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SuperAdminFindFirstOrThrowArgs>(args?: SelectSubset<T, SuperAdminFindFirstOrThrowArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SuperAdmins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SuperAdmins
     * const superAdmins = await prisma.superAdmin.findMany()
     * 
     * // Get first 10 SuperAdmins
     * const superAdmins = await prisma.superAdmin.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SuperAdminFindManyArgs>(args?: SelectSubset<T, SuperAdminFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SuperAdmin.
     * @param {SuperAdminCreateArgs} args - Arguments to create a SuperAdmin.
     * @example
     * // Create one SuperAdmin
     * const SuperAdmin = await prisma.superAdmin.create({
     *   data: {
     *     // ... data to create a SuperAdmin
     *   }
     * })
     * 
     */
    create<T extends SuperAdminCreateArgs>(args: SelectSubset<T, SuperAdminCreateArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SuperAdmins.
     * @param {SuperAdminCreateManyArgs} args - Arguments to create many SuperAdmins.
     * @example
     * // Create many SuperAdmins
     * const superAdmin = await prisma.superAdmin.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SuperAdminCreateManyArgs>(args?: SelectSubset<T, SuperAdminCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SuperAdmins and returns the data saved in the database.
     * @param {SuperAdminCreateManyAndReturnArgs} args - Arguments to create many SuperAdmins.
     * @example
     * // Create many SuperAdmins
     * const superAdmin = await prisma.superAdmin.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SuperAdmins and only return the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SuperAdminCreateManyAndReturnArgs>(args?: SelectSubset<T, SuperAdminCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SuperAdmin.
     * @param {SuperAdminDeleteArgs} args - Arguments to delete one SuperAdmin.
     * @example
     * // Delete one SuperAdmin
     * const SuperAdmin = await prisma.superAdmin.delete({
     *   where: {
     *     // ... filter to delete one SuperAdmin
     *   }
     * })
     * 
     */
    delete<T extends SuperAdminDeleteArgs>(args: SelectSubset<T, SuperAdminDeleteArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SuperAdmin.
     * @param {SuperAdminUpdateArgs} args - Arguments to update one SuperAdmin.
     * @example
     * // Update one SuperAdmin
     * const superAdmin = await prisma.superAdmin.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SuperAdminUpdateArgs>(args: SelectSubset<T, SuperAdminUpdateArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SuperAdmins.
     * @param {SuperAdminDeleteManyArgs} args - Arguments to filter SuperAdmins to delete.
     * @example
     * // Delete a few SuperAdmins
     * const { count } = await prisma.superAdmin.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SuperAdminDeleteManyArgs>(args?: SelectSubset<T, SuperAdminDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SuperAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SuperAdmins
     * const superAdmin = await prisma.superAdmin.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SuperAdminUpdateManyArgs>(args: SelectSubset<T, SuperAdminUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SuperAdmins and returns the data updated in the database.
     * @param {SuperAdminUpdateManyAndReturnArgs} args - Arguments to update many SuperAdmins.
     * @example
     * // Update many SuperAdmins
     * const superAdmin = await prisma.superAdmin.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SuperAdmins and only return the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SuperAdminUpdateManyAndReturnArgs>(args: SelectSubset<T, SuperAdminUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SuperAdmin.
     * @param {SuperAdminUpsertArgs} args - Arguments to update or create a SuperAdmin.
     * @example
     * // Update or create a SuperAdmin
     * const superAdmin = await prisma.superAdmin.upsert({
     *   create: {
     *     // ... data to create a SuperAdmin
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SuperAdmin we want to update
     *   }
     * })
     */
    upsert<T extends SuperAdminUpsertArgs>(args: SelectSubset<T, SuperAdminUpsertArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SuperAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminCountArgs} args - Arguments to filter SuperAdmins to count.
     * @example
     * // Count the number of SuperAdmins
     * const count = await prisma.superAdmin.count({
     *   where: {
     *     // ... the filter for the SuperAdmins we want to count
     *   }
     * })
    **/
    count<T extends SuperAdminCountArgs>(
      args?: Subset<T, SuperAdminCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SuperAdminCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SuperAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SuperAdminAggregateArgs>(args: Subset<T, SuperAdminAggregateArgs>): Prisma.PrismaPromise<GetSuperAdminAggregateType<T>>

    /**
     * Group by SuperAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SuperAdminGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SuperAdminGroupByArgs['orderBy'] }
        : { orderBy?: SuperAdminGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SuperAdminGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSuperAdminGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SuperAdmin model
   */
  readonly fields: SuperAdminFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SuperAdmin.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SuperAdminClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SuperAdmin model
   */
  interface SuperAdminFieldRefs {
    readonly id: FieldRef<"SuperAdmin", 'String'>
    readonly name: FieldRef<"SuperAdmin", 'String'>
    readonly email: FieldRef<"SuperAdmin", 'String'>
    readonly password: FieldRef<"SuperAdmin", 'String'>
    readonly permissions: FieldRef<"SuperAdmin", 'Json'>
    readonly isActive: FieldRef<"SuperAdmin", 'Boolean'>
    readonly lastLoginAt: FieldRef<"SuperAdmin", 'DateTime'>
    readonly createdAt: FieldRef<"SuperAdmin", 'DateTime'>
    readonly updatedAt: FieldRef<"SuperAdmin", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SuperAdmin findUnique
   */
  export type SuperAdminFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin findUniqueOrThrow
   */
  export type SuperAdminFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin findFirst
   */
  export type SuperAdminFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SuperAdmins.
     */
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin findFirstOrThrow
   */
  export type SuperAdminFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SuperAdmins.
     */
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin findMany
   */
  export type SuperAdminFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmins to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin create
   */
  export type SuperAdminCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data needed to create a SuperAdmin.
     */
    data: XOR<SuperAdminCreateInput, SuperAdminUncheckedCreateInput>
  }

  /**
   * SuperAdmin createMany
   */
  export type SuperAdminCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SuperAdmins.
     */
    data: SuperAdminCreateManyInput | SuperAdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SuperAdmin createManyAndReturn
   */
  export type SuperAdminCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data used to create many SuperAdmins.
     */
    data: SuperAdminCreateManyInput | SuperAdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SuperAdmin update
   */
  export type SuperAdminUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data needed to update a SuperAdmin.
     */
    data: XOR<SuperAdminUpdateInput, SuperAdminUncheckedUpdateInput>
    /**
     * Choose, which SuperAdmin to update.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin updateMany
   */
  export type SuperAdminUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SuperAdmins.
     */
    data: XOR<SuperAdminUpdateManyMutationInput, SuperAdminUncheckedUpdateManyInput>
    /**
     * Filter which SuperAdmins to update
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to update.
     */
    limit?: number
  }

  /**
   * SuperAdmin updateManyAndReturn
   */
  export type SuperAdminUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data used to update SuperAdmins.
     */
    data: XOR<SuperAdminUpdateManyMutationInput, SuperAdminUncheckedUpdateManyInput>
    /**
     * Filter which SuperAdmins to update
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to update.
     */
    limit?: number
  }

  /**
   * SuperAdmin upsert
   */
  export type SuperAdminUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The filter to search for the SuperAdmin to update in case it exists.
     */
    where: SuperAdminWhereUniqueInput
    /**
     * In case the SuperAdmin found by the `where` argument doesn't exist, create a new SuperAdmin with this data.
     */
    create: XOR<SuperAdminCreateInput, SuperAdminUncheckedCreateInput>
    /**
     * In case the SuperAdmin was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SuperAdminUpdateInput, SuperAdminUncheckedUpdateInput>
  }

  /**
   * SuperAdmin delete
   */
  export type SuperAdminDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter which SuperAdmin to delete.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin deleteMany
   */
  export type SuperAdminDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SuperAdmins to delete
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to delete.
     */
    limit?: number
  }

  /**
   * SuperAdmin without action
   */
  export type SuperAdminDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
  }


  /**
   * Model TenantApiKey
   */

  export type AggregateTenantApiKey = {
    _count: TenantApiKeyCountAggregateOutputType | null
    _min: TenantApiKeyMinAggregateOutputType | null
    _max: TenantApiKeyMaxAggregateOutputType | null
  }

  export type TenantApiKeyMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    keyName: string | null
    apiKey: string | null
    isActive: boolean | null
    lastUsedAt: Date | null
    createdAt: Date | null
    expiresAt: Date | null
  }

  export type TenantApiKeyMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    keyName: string | null
    apiKey: string | null
    isActive: boolean | null
    lastUsedAt: Date | null
    createdAt: Date | null
    expiresAt: Date | null
  }

  export type TenantApiKeyCountAggregateOutputType = {
    id: number
    tenantId: number
    keyName: number
    apiKey: number
    isActive: number
    lastUsedAt: number
    createdAt: number
    expiresAt: number
    _all: number
  }


  export type TenantApiKeyMinAggregateInputType = {
    id?: true
    tenantId?: true
    keyName?: true
    apiKey?: true
    isActive?: true
    lastUsedAt?: true
    createdAt?: true
    expiresAt?: true
  }

  export type TenantApiKeyMaxAggregateInputType = {
    id?: true
    tenantId?: true
    keyName?: true
    apiKey?: true
    isActive?: true
    lastUsedAt?: true
    createdAt?: true
    expiresAt?: true
  }

  export type TenantApiKeyCountAggregateInputType = {
    id?: true
    tenantId?: true
    keyName?: true
    apiKey?: true
    isActive?: true
    lastUsedAt?: true
    createdAt?: true
    expiresAt?: true
    _all?: true
  }

  export type TenantApiKeyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantApiKey to aggregate.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantApiKeys
    **/
    _count?: true | TenantApiKeyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantApiKeyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantApiKeyMaxAggregateInputType
  }

  export type GetTenantApiKeyAggregateType<T extends TenantApiKeyAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantApiKey]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantApiKey[P]>
      : GetScalarType<T[P], AggregateTenantApiKey[P]>
  }




  export type TenantApiKeyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantApiKeyWhereInput
    orderBy?: TenantApiKeyOrderByWithAggregationInput | TenantApiKeyOrderByWithAggregationInput[]
    by: TenantApiKeyScalarFieldEnum[] | TenantApiKeyScalarFieldEnum
    having?: TenantApiKeyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantApiKeyCountAggregateInputType | true
    _min?: TenantApiKeyMinAggregateInputType
    _max?: TenantApiKeyMaxAggregateInputType
  }

  export type TenantApiKeyGroupByOutputType = {
    id: string
    tenantId: string
    keyName: string
    apiKey: string
    isActive: boolean
    lastUsedAt: Date | null
    createdAt: Date
    expiresAt: Date | null
    _count: TenantApiKeyCountAggregateOutputType | null
    _min: TenantApiKeyMinAggregateOutputType | null
    _max: TenantApiKeyMaxAggregateOutputType | null
  }

  type GetTenantApiKeyGroupByPayload<T extends TenantApiKeyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantApiKeyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantApiKeyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantApiKeyGroupByOutputType[P]>
            : GetScalarType<T[P], TenantApiKeyGroupByOutputType[P]>
        }
      >
    >


  export type TenantApiKeySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    keyName?: boolean
    apiKey?: boolean
    isActive?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    expiresAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantApiKey"]>

  export type TenantApiKeySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    keyName?: boolean
    apiKey?: boolean
    isActive?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    expiresAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantApiKey"]>

  export type TenantApiKeySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    keyName?: boolean
    apiKey?: boolean
    isActive?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    expiresAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantApiKey"]>

  export type TenantApiKeySelectScalar = {
    id?: boolean
    tenantId?: boolean
    keyName?: boolean
    apiKey?: boolean
    isActive?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    expiresAt?: boolean
  }

  export type TenantApiKeyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "keyName" | "apiKey" | "isActive" | "lastUsedAt" | "createdAt" | "expiresAt", ExtArgs["result"]["tenantApiKey"]>
  export type TenantApiKeyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantApiKeyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantApiKeyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $TenantApiKeyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantApiKey"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      keyName: string
      apiKey: string
      isActive: boolean
      lastUsedAt: Date | null
      createdAt: Date
      expiresAt: Date | null
    }, ExtArgs["result"]["tenantApiKey"]>
    composites: {}
  }

  type TenantApiKeyGetPayload<S extends boolean | null | undefined | TenantApiKeyDefaultArgs> = $Result.GetResult<Prisma.$TenantApiKeyPayload, S>

  type TenantApiKeyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantApiKeyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantApiKeyCountAggregateInputType | true
    }

  export interface TenantApiKeyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantApiKey'], meta: { name: 'TenantApiKey' } }
    /**
     * Find zero or one TenantApiKey that matches the filter.
     * @param {TenantApiKeyFindUniqueArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantApiKeyFindUniqueArgs>(args: SelectSubset<T, TenantApiKeyFindUniqueArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantApiKey that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantApiKeyFindUniqueOrThrowArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantApiKeyFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantApiKeyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantApiKey that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyFindFirstArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantApiKeyFindFirstArgs>(args?: SelectSubset<T, TenantApiKeyFindFirstArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantApiKey that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyFindFirstOrThrowArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantApiKeyFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantApiKeyFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantApiKeys that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantApiKeys
     * const tenantApiKeys = await prisma.tenantApiKey.findMany()
     * 
     * // Get first 10 TenantApiKeys
     * const tenantApiKeys = await prisma.tenantApiKey.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantApiKeyWithIdOnly = await prisma.tenantApiKey.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantApiKeyFindManyArgs>(args?: SelectSubset<T, TenantApiKeyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantApiKey.
     * @param {TenantApiKeyCreateArgs} args - Arguments to create a TenantApiKey.
     * @example
     * // Create one TenantApiKey
     * const TenantApiKey = await prisma.tenantApiKey.create({
     *   data: {
     *     // ... data to create a TenantApiKey
     *   }
     * })
     * 
     */
    create<T extends TenantApiKeyCreateArgs>(args: SelectSubset<T, TenantApiKeyCreateArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantApiKeys.
     * @param {TenantApiKeyCreateManyArgs} args - Arguments to create many TenantApiKeys.
     * @example
     * // Create many TenantApiKeys
     * const tenantApiKey = await prisma.tenantApiKey.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantApiKeyCreateManyArgs>(args?: SelectSubset<T, TenantApiKeyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantApiKeys and returns the data saved in the database.
     * @param {TenantApiKeyCreateManyAndReturnArgs} args - Arguments to create many TenantApiKeys.
     * @example
     * // Create many TenantApiKeys
     * const tenantApiKey = await prisma.tenantApiKey.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantApiKeys and only return the `id`
     * const tenantApiKeyWithIdOnly = await prisma.tenantApiKey.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantApiKeyCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantApiKeyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantApiKey.
     * @param {TenantApiKeyDeleteArgs} args - Arguments to delete one TenantApiKey.
     * @example
     * // Delete one TenantApiKey
     * const TenantApiKey = await prisma.tenantApiKey.delete({
     *   where: {
     *     // ... filter to delete one TenantApiKey
     *   }
     * })
     * 
     */
    delete<T extends TenantApiKeyDeleteArgs>(args: SelectSubset<T, TenantApiKeyDeleteArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantApiKey.
     * @param {TenantApiKeyUpdateArgs} args - Arguments to update one TenantApiKey.
     * @example
     * // Update one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantApiKeyUpdateArgs>(args: SelectSubset<T, TenantApiKeyUpdateArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantApiKeys.
     * @param {TenantApiKeyDeleteManyArgs} args - Arguments to filter TenantApiKeys to delete.
     * @example
     * // Delete a few TenantApiKeys
     * const { count } = await prisma.tenantApiKey.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantApiKeyDeleteManyArgs>(args?: SelectSubset<T, TenantApiKeyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantApiKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantApiKeys
     * const tenantApiKey = await prisma.tenantApiKey.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantApiKeyUpdateManyArgs>(args: SelectSubset<T, TenantApiKeyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantApiKeys and returns the data updated in the database.
     * @param {TenantApiKeyUpdateManyAndReturnArgs} args - Arguments to update many TenantApiKeys.
     * @example
     * // Update many TenantApiKeys
     * const tenantApiKey = await prisma.tenantApiKey.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantApiKeys and only return the `id`
     * const tenantApiKeyWithIdOnly = await prisma.tenantApiKey.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantApiKeyUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantApiKeyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantApiKey.
     * @param {TenantApiKeyUpsertArgs} args - Arguments to update or create a TenantApiKey.
     * @example
     * // Update or create a TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.upsert({
     *   create: {
     *     // ... data to create a TenantApiKey
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantApiKey we want to update
     *   }
     * })
     */
    upsert<T extends TenantApiKeyUpsertArgs>(args: SelectSubset<T, TenantApiKeyUpsertArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantApiKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyCountArgs} args - Arguments to filter TenantApiKeys to count.
     * @example
     * // Count the number of TenantApiKeys
     * const count = await prisma.tenantApiKey.count({
     *   where: {
     *     // ... the filter for the TenantApiKeys we want to count
     *   }
     * })
    **/
    count<T extends TenantApiKeyCountArgs>(
      args?: Subset<T, TenantApiKeyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantApiKeyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantApiKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantApiKeyAggregateArgs>(args: Subset<T, TenantApiKeyAggregateArgs>): Prisma.PrismaPromise<GetTenantApiKeyAggregateType<T>>

    /**
     * Group by TenantApiKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantApiKeyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantApiKeyGroupByArgs['orderBy'] }
        : { orderBy?: TenantApiKeyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantApiKeyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantApiKeyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantApiKey model
   */
  readonly fields: TenantApiKeyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantApiKey.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantApiKeyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantApiKey model
   */
  interface TenantApiKeyFieldRefs {
    readonly id: FieldRef<"TenantApiKey", 'String'>
    readonly tenantId: FieldRef<"TenantApiKey", 'String'>
    readonly keyName: FieldRef<"TenantApiKey", 'String'>
    readonly apiKey: FieldRef<"TenantApiKey", 'String'>
    readonly isActive: FieldRef<"TenantApiKey", 'Boolean'>
    readonly lastUsedAt: FieldRef<"TenantApiKey", 'DateTime'>
    readonly createdAt: FieldRef<"TenantApiKey", 'DateTime'>
    readonly expiresAt: FieldRef<"TenantApiKey", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantApiKey findUnique
   */
  export type TenantApiKeyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyInclude<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey findUniqueOrThrow
   */
  export type TenantApiKeyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyInclude<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey findFirst
   */
  export type TenantApiKeyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyInclude<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantApiKeys.
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantApiKeys.
     */
    distinct?: TenantApiKeyScalarFieldEnum | TenantApiKeyScalarFieldEnum[]
  }

  /**
   * TenantApiKey findFirstOrThrow
   */
  export type TenantApiKeyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyInclude<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantApiKeys.
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantApiKeys.
     */
    distinct?: TenantApiKeyScalarFieldEnum | TenantApiKeyScalarFieldEnum[]
  }

  /**
   * TenantApiKey findMany
   */
  export type TenantApiKeyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyInclude<ExtArgs> | null
    /**
     * Filter, which TenantApiKeys to fetch.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantApiKeys.
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    distinct?: TenantApiKeyScalarFieldEnum | TenantApiKeyScalarFieldEnum[]
  }

  /**
   * TenantApiKey create
   */
  export type TenantApiKeyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantApiKey.
     */
    data: XOR<TenantApiKeyCreateInput, TenantApiKeyUncheckedCreateInput>
  }

  /**
   * TenantApiKey createMany
   */
  export type TenantApiKeyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantApiKeys.
     */
    data: TenantApiKeyCreateManyInput | TenantApiKeyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantApiKey createManyAndReturn
   */
  export type TenantApiKeyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * The data used to create many TenantApiKeys.
     */
    data: TenantApiKeyCreateManyInput | TenantApiKeyCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantApiKey update
   */
  export type TenantApiKeyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantApiKey.
     */
    data: XOR<TenantApiKeyUpdateInput, TenantApiKeyUncheckedUpdateInput>
    /**
     * Choose, which TenantApiKey to update.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey updateMany
   */
  export type TenantApiKeyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantApiKeys.
     */
    data: XOR<TenantApiKeyUpdateManyMutationInput, TenantApiKeyUncheckedUpdateManyInput>
    /**
     * Filter which TenantApiKeys to update
     */
    where?: TenantApiKeyWhereInput
    /**
     * Limit how many TenantApiKeys to update.
     */
    limit?: number
  }

  /**
   * TenantApiKey updateManyAndReturn
   */
  export type TenantApiKeyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * The data used to update TenantApiKeys.
     */
    data: XOR<TenantApiKeyUpdateManyMutationInput, TenantApiKeyUncheckedUpdateManyInput>
    /**
     * Filter which TenantApiKeys to update
     */
    where?: TenantApiKeyWhereInput
    /**
     * Limit how many TenantApiKeys to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantApiKey upsert
   */
  export type TenantApiKeyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantApiKey to update in case it exists.
     */
    where: TenantApiKeyWhereUniqueInput
    /**
     * In case the TenantApiKey found by the `where` argument doesn't exist, create a new TenantApiKey with this data.
     */
    create: XOR<TenantApiKeyCreateInput, TenantApiKeyUncheckedCreateInput>
    /**
     * In case the TenantApiKey was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantApiKeyUpdateInput, TenantApiKeyUncheckedUpdateInput>
  }

  /**
   * TenantApiKey delete
   */
  export type TenantApiKeyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyInclude<ExtArgs> | null
    /**
     * Filter which TenantApiKey to delete.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey deleteMany
   */
  export type TenantApiKeyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantApiKeys to delete
     */
    where?: TenantApiKeyWhereInput
    /**
     * Limit how many TenantApiKeys to delete.
     */
    limit?: number
  }

  /**
   * TenantApiKey without action
   */
  export type TenantApiKeyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantApiKeyInclude<ExtArgs> | null
  }


  /**
   * Model TenantUsageStats
   */

  export type AggregateTenantUsageStats = {
    _count: TenantUsageStatsCountAggregateOutputType | null
    _avg: TenantUsageStatsAvgAggregateOutputType | null
    _sum: TenantUsageStatsSumAggregateOutputType | null
    _min: TenantUsageStatsMinAggregateOutputType | null
    _max: TenantUsageStatsMaxAggregateOutputType | null
  }

  export type TenantUsageStatsAvgAggregateOutputType = {
    apiCalls: number | null
    storageUsedMB: number | null
    activeUsers: number | null
  }

  export type TenantUsageStatsSumAggregateOutputType = {
    apiCalls: number | null
    storageUsedMB: number | null
    activeUsers: number | null
  }

  export type TenantUsageStatsMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    date: Date | null
    apiCalls: number | null
    storageUsedMB: number | null
    activeUsers: number | null
    createdAt: Date | null
  }

  export type TenantUsageStatsMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    date: Date | null
    apiCalls: number | null
    storageUsedMB: number | null
    activeUsers: number | null
    createdAt: Date | null
  }

  export type TenantUsageStatsCountAggregateOutputType = {
    id: number
    tenantId: number
    date: number
    apiCalls: number
    storageUsedMB: number
    activeUsers: number
    createdAt: number
    _all: number
  }


  export type TenantUsageStatsAvgAggregateInputType = {
    apiCalls?: true
    storageUsedMB?: true
    activeUsers?: true
  }

  export type TenantUsageStatsSumAggregateInputType = {
    apiCalls?: true
    storageUsedMB?: true
    activeUsers?: true
  }

  export type TenantUsageStatsMinAggregateInputType = {
    id?: true
    tenantId?: true
    date?: true
    apiCalls?: true
    storageUsedMB?: true
    activeUsers?: true
    createdAt?: true
  }

  export type TenantUsageStatsMaxAggregateInputType = {
    id?: true
    tenantId?: true
    date?: true
    apiCalls?: true
    storageUsedMB?: true
    activeUsers?: true
    createdAt?: true
  }

  export type TenantUsageStatsCountAggregateInputType = {
    id?: true
    tenantId?: true
    date?: true
    apiCalls?: true
    storageUsedMB?: true
    activeUsers?: true
    createdAt?: true
    _all?: true
  }

  export type TenantUsageStatsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantUsageStats to aggregate.
     */
    where?: TenantUsageStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantUsageStats to fetch.
     */
    orderBy?: TenantUsageStatsOrderByWithRelationInput | TenantUsageStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantUsageStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantUsageStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantUsageStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantUsageStats
    **/
    _count?: true | TenantUsageStatsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TenantUsageStatsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TenantUsageStatsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantUsageStatsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantUsageStatsMaxAggregateInputType
  }

  export type GetTenantUsageStatsAggregateType<T extends TenantUsageStatsAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantUsageStats]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantUsageStats[P]>
      : GetScalarType<T[P], AggregateTenantUsageStats[P]>
  }




  export type TenantUsageStatsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantUsageStatsWhereInput
    orderBy?: TenantUsageStatsOrderByWithAggregationInput | TenantUsageStatsOrderByWithAggregationInput[]
    by: TenantUsageStatsScalarFieldEnum[] | TenantUsageStatsScalarFieldEnum
    having?: TenantUsageStatsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantUsageStatsCountAggregateInputType | true
    _avg?: TenantUsageStatsAvgAggregateInputType
    _sum?: TenantUsageStatsSumAggregateInputType
    _min?: TenantUsageStatsMinAggregateInputType
    _max?: TenantUsageStatsMaxAggregateInputType
  }

  export type TenantUsageStatsGroupByOutputType = {
    id: string
    tenantId: string
    date: Date
    apiCalls: number
    storageUsedMB: number
    activeUsers: number
    createdAt: Date
    _count: TenantUsageStatsCountAggregateOutputType | null
    _avg: TenantUsageStatsAvgAggregateOutputType | null
    _sum: TenantUsageStatsSumAggregateOutputType | null
    _min: TenantUsageStatsMinAggregateOutputType | null
    _max: TenantUsageStatsMaxAggregateOutputType | null
  }

  type GetTenantUsageStatsGroupByPayload<T extends TenantUsageStatsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantUsageStatsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantUsageStatsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantUsageStatsGroupByOutputType[P]>
            : GetScalarType<T[P], TenantUsageStatsGroupByOutputType[P]>
        }
      >
    >


  export type TenantUsageStatsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    date?: boolean
    apiCalls?: boolean
    storageUsedMB?: boolean
    activeUsers?: boolean
    createdAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantUsageStats"]>

  export type TenantUsageStatsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    date?: boolean
    apiCalls?: boolean
    storageUsedMB?: boolean
    activeUsers?: boolean
    createdAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantUsageStats"]>

  export type TenantUsageStatsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    date?: boolean
    apiCalls?: boolean
    storageUsedMB?: boolean
    activeUsers?: boolean
    createdAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantUsageStats"]>

  export type TenantUsageStatsSelectScalar = {
    id?: boolean
    tenantId?: boolean
    date?: boolean
    apiCalls?: boolean
    storageUsedMB?: boolean
    activeUsers?: boolean
    createdAt?: boolean
  }

  export type TenantUsageStatsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "date" | "apiCalls" | "storageUsedMB" | "activeUsers" | "createdAt", ExtArgs["result"]["tenantUsageStats"]>
  export type TenantUsageStatsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantUsageStatsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type TenantUsageStatsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $TenantUsageStatsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantUsageStats"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      date: Date
      apiCalls: number
      storageUsedMB: number
      activeUsers: number
      createdAt: Date
    }, ExtArgs["result"]["tenantUsageStats"]>
    composites: {}
  }

  type TenantUsageStatsGetPayload<S extends boolean | null | undefined | TenantUsageStatsDefaultArgs> = $Result.GetResult<Prisma.$TenantUsageStatsPayload, S>

  type TenantUsageStatsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantUsageStatsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantUsageStatsCountAggregateInputType | true
    }

  export interface TenantUsageStatsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantUsageStats'], meta: { name: 'TenantUsageStats' } }
    /**
     * Find zero or one TenantUsageStats that matches the filter.
     * @param {TenantUsageStatsFindUniqueArgs} args - Arguments to find a TenantUsageStats
     * @example
     * // Get one TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantUsageStatsFindUniqueArgs>(args: SelectSubset<T, TenantUsageStatsFindUniqueArgs<ExtArgs>>): Prisma__TenantUsageStatsClient<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantUsageStats that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantUsageStatsFindUniqueOrThrowArgs} args - Arguments to find a TenantUsageStats
     * @example
     * // Get one TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantUsageStatsFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantUsageStatsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantUsageStatsClient<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantUsageStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageStatsFindFirstArgs} args - Arguments to find a TenantUsageStats
     * @example
     * // Get one TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantUsageStatsFindFirstArgs>(args?: SelectSubset<T, TenantUsageStatsFindFirstArgs<ExtArgs>>): Prisma__TenantUsageStatsClient<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantUsageStats that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageStatsFindFirstOrThrowArgs} args - Arguments to find a TenantUsageStats
     * @example
     * // Get one TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantUsageStatsFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantUsageStatsFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantUsageStatsClient<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantUsageStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageStatsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.findMany()
     * 
     * // Get first 10 TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantUsageStatsWithIdOnly = await prisma.tenantUsageStats.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantUsageStatsFindManyArgs>(args?: SelectSubset<T, TenantUsageStatsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantUsageStats.
     * @param {TenantUsageStatsCreateArgs} args - Arguments to create a TenantUsageStats.
     * @example
     * // Create one TenantUsageStats
     * const TenantUsageStats = await prisma.tenantUsageStats.create({
     *   data: {
     *     // ... data to create a TenantUsageStats
     *   }
     * })
     * 
     */
    create<T extends TenantUsageStatsCreateArgs>(args: SelectSubset<T, TenantUsageStatsCreateArgs<ExtArgs>>): Prisma__TenantUsageStatsClient<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantUsageStats.
     * @param {TenantUsageStatsCreateManyArgs} args - Arguments to create many TenantUsageStats.
     * @example
     * // Create many TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantUsageStatsCreateManyArgs>(args?: SelectSubset<T, TenantUsageStatsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantUsageStats and returns the data saved in the database.
     * @param {TenantUsageStatsCreateManyAndReturnArgs} args - Arguments to create many TenantUsageStats.
     * @example
     * // Create many TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantUsageStats and only return the `id`
     * const tenantUsageStatsWithIdOnly = await prisma.tenantUsageStats.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantUsageStatsCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantUsageStatsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantUsageStats.
     * @param {TenantUsageStatsDeleteArgs} args - Arguments to delete one TenantUsageStats.
     * @example
     * // Delete one TenantUsageStats
     * const TenantUsageStats = await prisma.tenantUsageStats.delete({
     *   where: {
     *     // ... filter to delete one TenantUsageStats
     *   }
     * })
     * 
     */
    delete<T extends TenantUsageStatsDeleteArgs>(args: SelectSubset<T, TenantUsageStatsDeleteArgs<ExtArgs>>): Prisma__TenantUsageStatsClient<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantUsageStats.
     * @param {TenantUsageStatsUpdateArgs} args - Arguments to update one TenantUsageStats.
     * @example
     * // Update one TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUsageStatsUpdateArgs>(args: SelectSubset<T, TenantUsageStatsUpdateArgs<ExtArgs>>): Prisma__TenantUsageStatsClient<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantUsageStats.
     * @param {TenantUsageStatsDeleteManyArgs} args - Arguments to filter TenantUsageStats to delete.
     * @example
     * // Delete a few TenantUsageStats
     * const { count } = await prisma.tenantUsageStats.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantUsageStatsDeleteManyArgs>(args?: SelectSubset<T, TenantUsageStatsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantUsageStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageStatsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUsageStatsUpdateManyArgs>(args: SelectSubset<T, TenantUsageStatsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantUsageStats and returns the data updated in the database.
     * @param {TenantUsageStatsUpdateManyAndReturnArgs} args - Arguments to update many TenantUsageStats.
     * @example
     * // Update many TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantUsageStats and only return the `id`
     * const tenantUsageStatsWithIdOnly = await prisma.tenantUsageStats.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantUsageStatsUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantUsageStatsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantUsageStats.
     * @param {TenantUsageStatsUpsertArgs} args - Arguments to update or create a TenantUsageStats.
     * @example
     * // Update or create a TenantUsageStats
     * const tenantUsageStats = await prisma.tenantUsageStats.upsert({
     *   create: {
     *     // ... data to create a TenantUsageStats
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantUsageStats we want to update
     *   }
     * })
     */
    upsert<T extends TenantUsageStatsUpsertArgs>(args: SelectSubset<T, TenantUsageStatsUpsertArgs<ExtArgs>>): Prisma__TenantUsageStatsClient<$Result.GetResult<Prisma.$TenantUsageStatsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantUsageStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageStatsCountArgs} args - Arguments to filter TenantUsageStats to count.
     * @example
     * // Count the number of TenantUsageStats
     * const count = await prisma.tenantUsageStats.count({
     *   where: {
     *     // ... the filter for the TenantUsageStats we want to count
     *   }
     * })
    **/
    count<T extends TenantUsageStatsCountArgs>(
      args?: Subset<T, TenantUsageStatsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantUsageStatsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantUsageStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageStatsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantUsageStatsAggregateArgs>(args: Subset<T, TenantUsageStatsAggregateArgs>): Prisma.PrismaPromise<GetTenantUsageStatsAggregateType<T>>

    /**
     * Group by TenantUsageStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageStatsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantUsageStatsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantUsageStatsGroupByArgs['orderBy'] }
        : { orderBy?: TenantUsageStatsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantUsageStatsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantUsageStatsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantUsageStats model
   */
  readonly fields: TenantUsageStatsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantUsageStats.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantUsageStatsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantUsageStats model
   */
  interface TenantUsageStatsFieldRefs {
    readonly id: FieldRef<"TenantUsageStats", 'String'>
    readonly tenantId: FieldRef<"TenantUsageStats", 'String'>
    readonly date: FieldRef<"TenantUsageStats", 'DateTime'>
    readonly apiCalls: FieldRef<"TenantUsageStats", 'Int'>
    readonly storageUsedMB: FieldRef<"TenantUsageStats", 'Int'>
    readonly activeUsers: FieldRef<"TenantUsageStats", 'Int'>
    readonly createdAt: FieldRef<"TenantUsageStats", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantUsageStats findUnique
   */
  export type TenantUsageStatsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsInclude<ExtArgs> | null
    /**
     * Filter, which TenantUsageStats to fetch.
     */
    where: TenantUsageStatsWhereUniqueInput
  }

  /**
   * TenantUsageStats findUniqueOrThrow
   */
  export type TenantUsageStatsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsInclude<ExtArgs> | null
    /**
     * Filter, which TenantUsageStats to fetch.
     */
    where: TenantUsageStatsWhereUniqueInput
  }

  /**
   * TenantUsageStats findFirst
   */
  export type TenantUsageStatsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsInclude<ExtArgs> | null
    /**
     * Filter, which TenantUsageStats to fetch.
     */
    where?: TenantUsageStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantUsageStats to fetch.
     */
    orderBy?: TenantUsageStatsOrderByWithRelationInput | TenantUsageStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantUsageStats.
     */
    cursor?: TenantUsageStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantUsageStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantUsageStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantUsageStats.
     */
    distinct?: TenantUsageStatsScalarFieldEnum | TenantUsageStatsScalarFieldEnum[]
  }

  /**
   * TenantUsageStats findFirstOrThrow
   */
  export type TenantUsageStatsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsInclude<ExtArgs> | null
    /**
     * Filter, which TenantUsageStats to fetch.
     */
    where?: TenantUsageStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantUsageStats to fetch.
     */
    orderBy?: TenantUsageStatsOrderByWithRelationInput | TenantUsageStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantUsageStats.
     */
    cursor?: TenantUsageStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantUsageStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantUsageStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantUsageStats.
     */
    distinct?: TenantUsageStatsScalarFieldEnum | TenantUsageStatsScalarFieldEnum[]
  }

  /**
   * TenantUsageStats findMany
   */
  export type TenantUsageStatsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsInclude<ExtArgs> | null
    /**
     * Filter, which TenantUsageStats to fetch.
     */
    where?: TenantUsageStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantUsageStats to fetch.
     */
    orderBy?: TenantUsageStatsOrderByWithRelationInput | TenantUsageStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantUsageStats.
     */
    cursor?: TenantUsageStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantUsageStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantUsageStats.
     */
    skip?: number
    distinct?: TenantUsageStatsScalarFieldEnum | TenantUsageStatsScalarFieldEnum[]
  }

  /**
   * TenantUsageStats create
   */
  export type TenantUsageStatsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantUsageStats.
     */
    data: XOR<TenantUsageStatsCreateInput, TenantUsageStatsUncheckedCreateInput>
  }

  /**
   * TenantUsageStats createMany
   */
  export type TenantUsageStatsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantUsageStats.
     */
    data: TenantUsageStatsCreateManyInput | TenantUsageStatsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantUsageStats createManyAndReturn
   */
  export type TenantUsageStatsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * The data used to create many TenantUsageStats.
     */
    data: TenantUsageStatsCreateManyInput | TenantUsageStatsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantUsageStats update
   */
  export type TenantUsageStatsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantUsageStats.
     */
    data: XOR<TenantUsageStatsUpdateInput, TenantUsageStatsUncheckedUpdateInput>
    /**
     * Choose, which TenantUsageStats to update.
     */
    where: TenantUsageStatsWhereUniqueInput
  }

  /**
   * TenantUsageStats updateMany
   */
  export type TenantUsageStatsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantUsageStats.
     */
    data: XOR<TenantUsageStatsUpdateManyMutationInput, TenantUsageStatsUncheckedUpdateManyInput>
    /**
     * Filter which TenantUsageStats to update
     */
    where?: TenantUsageStatsWhereInput
    /**
     * Limit how many TenantUsageStats to update.
     */
    limit?: number
  }

  /**
   * TenantUsageStats updateManyAndReturn
   */
  export type TenantUsageStatsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * The data used to update TenantUsageStats.
     */
    data: XOR<TenantUsageStatsUpdateManyMutationInput, TenantUsageStatsUncheckedUpdateManyInput>
    /**
     * Filter which TenantUsageStats to update
     */
    where?: TenantUsageStatsWhereInput
    /**
     * Limit how many TenantUsageStats to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantUsageStats upsert
   */
  export type TenantUsageStatsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantUsageStats to update in case it exists.
     */
    where: TenantUsageStatsWhereUniqueInput
    /**
     * In case the TenantUsageStats found by the `where` argument doesn't exist, create a new TenantUsageStats with this data.
     */
    create: XOR<TenantUsageStatsCreateInput, TenantUsageStatsUncheckedCreateInput>
    /**
     * In case the TenantUsageStats was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUsageStatsUpdateInput, TenantUsageStatsUncheckedUpdateInput>
  }

  /**
   * TenantUsageStats delete
   */
  export type TenantUsageStatsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsInclude<ExtArgs> | null
    /**
     * Filter which TenantUsageStats to delete.
     */
    where: TenantUsageStatsWhereUniqueInput
  }

  /**
   * TenantUsageStats deleteMany
   */
  export type TenantUsageStatsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantUsageStats to delete
     */
    where?: TenantUsageStatsWhereInput
    /**
     * Limit how many TenantUsageStats to delete.
     */
    limit?: number
  }

  /**
   * TenantUsageStats without action
   */
  export type TenantUsageStatsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsageStats
     */
    select?: TenantUsageStatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantUsageStats
     */
    omit?: TenantUsageStatsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageStatsInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TenantScalarFieldEnum: {
    id: 'id',
    slug: 'slug',
    companyName: 'companyName',
    companyDocument: 'companyDocument',
    status: 'status',
    databaseHost: 'databaseHost',
    databasePort: 'databasePort',
    databaseName: 'databaseName',
    databaseUser: 'databaseUser',
    databasePassword: 'databasePassword',
    subdomain: 'subdomain',
    customDomain: 'customDomain',
    adminSubdomain: 'adminSubdomain',
    maxUsers: 'maxUsers',
    maxAdmins: 'maxAdmins',
    maxStorageGB: 'maxStorageGB',
    subscriptionPlan: 'subscriptionPlan',
    subscriptionStatus: 'subscriptionStatus',
    monthlyFee: 'monthlyFee',
    trialEndsAt: 'trialEndsAt',
    nextBillingDate: 'nextBillingDate',
    lastBillingDate: 'lastBillingDate',
    totalBilled: 'totalBilled',
    outstandingBalance: 'outstandingBalance',
    contactName: 'contactName',
    contactEmail: 'contactEmail',
    contactPhone: 'contactPhone',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const TenantBrandingScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    logoUrl: 'logoUrl',
    logoIconUrl: 'logoIconUrl',
    faviconUrl: 'faviconUrl',
    primaryColor: 'primaryColor',
    secondaryColor: 'secondaryColor',
    accentColor: 'accentColor',
    backgroundColor: 'backgroundColor',
    textColor: 'textColor',
    appName: 'appName',
    appDescription: 'appDescription',
    appStoreUrl: 'appStoreUrl',
    playStoreUrl: 'playStoreUrl',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantBrandingScalarFieldEnum = (typeof TenantBrandingScalarFieldEnum)[keyof typeof TenantBrandingScalarFieldEnum]


  export const TenantModuleScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    moduleKey: 'moduleKey',
    isEnabled: 'isEnabled',
    isEnabledByDefault: 'isEnabledByDefault',
    config: 'config',
    displayName: 'displayName',
    description: 'description',
    sortOrder: 'sortOrder',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantModuleScalarFieldEnum = (typeof TenantModuleScalarFieldEnum)[keyof typeof TenantModuleScalarFieldEnum]


  export const TenantStatsScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    totalUsers: 'totalUsers',
    totalConsumers: 'totalConsumers',
    totalMerchants: 'totalMerchants',
    activeUsers30d: 'activeUsers30d',
    totalPurchases: 'totalPurchases',
    totalRevenue: 'totalRevenue',
    totalCashbackPaid: 'totalCashbackPaid',
    totalPlatformFees: 'totalPlatformFees',
    totalProducts: 'totalProducts',
    revenue30d: 'revenue30d',
    purchases30d: 'purchases30d',
    cashback30d: 'cashback30d',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantStatsScalarFieldEnum = (typeof TenantStatsScalarFieldEnum)[keyof typeof TenantStatsScalarFieldEnum]


  export const GlobalStatsScalarFieldEnum: {
    id: 'id',
    date: 'date',
    totalTenants: 'totalTenants',
    totalUsers: 'totalUsers',
    totalConsumers: 'totalConsumers',
    totalMerchants: 'totalMerchants',
    totalPurchases: 'totalPurchases',
    totalRevenue: 'totalRevenue',
    totalCashbackPaid: 'totalCashbackPaid',
    totalPlatformFees: 'totalPlatformFees',
    totalProducts: 'totalProducts',
    activeUsers30d: 'activeUsers30d',
    revenue30d: 'revenue30d',
    purchases30d: 'purchases30d',
    cashback30d: 'cashback30d',
    newTenants: 'newTenants',
    newUsers: 'newUsers',
    churnedTenants: 'churnedTenants',
    createdAt: 'createdAt'
  };

  export type GlobalStatsScalarFieldEnum = (typeof GlobalStatsScalarFieldEnum)[keyof typeof GlobalStatsScalarFieldEnum]


  export const TenantCashbackConfigScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    consumerPercent: 'consumerPercent',
    clubPercent: 'clubPercent',
    consumerReferrerPercent: 'consumerReferrerPercent',
    merchantReferrerPercent: 'merchantReferrerPercent',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantCashbackConfigScalarFieldEnum = (typeof TenantCashbackConfigScalarFieldEnum)[keyof typeof TenantCashbackConfigScalarFieldEnum]


  export const TenantWithdrawalConfigScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    withdrawalFeePercent: 'withdrawalFeePercent',
    withdrawalFeeFixed: 'withdrawalFeeFixed',
    minWithdrawalAmount: 'minWithdrawalAmount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantWithdrawalConfigScalarFieldEnum = (typeof TenantWithdrawalConfigScalarFieldEnum)[keyof typeof TenantWithdrawalConfigScalarFieldEnum]


  export const TenantAdminScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
    isActive: 'isActive',
    lastLoginAt: 'lastLoginAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantAdminScalarFieldEnum = (typeof TenantAdminScalarFieldEnum)[keyof typeof TenantAdminScalarFieldEnum]


  export const SuperAdminScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    permissions: 'permissions',
    isActive: 'isActive',
    lastLoginAt: 'lastLoginAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SuperAdminScalarFieldEnum = (typeof SuperAdminScalarFieldEnum)[keyof typeof SuperAdminScalarFieldEnum]


  export const TenantApiKeyScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    keyName: 'keyName',
    apiKey: 'apiKey',
    isActive: 'isActive',
    lastUsedAt: 'lastUsedAt',
    createdAt: 'createdAt',
    expiresAt: 'expiresAt'
  };

  export type TenantApiKeyScalarFieldEnum = (typeof TenantApiKeyScalarFieldEnum)[keyof typeof TenantApiKeyScalarFieldEnum]


  export const TenantUsageStatsScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    date: 'date',
    apiCalls: 'apiCalls',
    storageUsedMB: 'storageUsedMB',
    activeUsers: 'activeUsers',
    createdAt: 'createdAt'
  };

  export type TenantUsageStatsScalarFieldEnum = (typeof TenantUsageStatsScalarFieldEnum)[keyof typeof TenantUsageStatsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'TenantStatus'
   */
  export type EnumTenantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TenantStatus'>
    


  /**
   * Reference to a field of type 'TenantStatus[]'
   */
  export type ListEnumTenantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TenantStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'SubscriptionPlan'
   */
  export type EnumSubscriptionPlanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubscriptionPlan'>
    


  /**
   * Reference to a field of type 'SubscriptionPlan[]'
   */
  export type ListEnumSubscriptionPlanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubscriptionPlan[]'>
    


  /**
   * Reference to a field of type 'SubscriptionStatus'
   */
  export type EnumSubscriptionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubscriptionStatus'>
    


  /**
   * Reference to a field of type 'SubscriptionStatus[]'
   */
  export type ListEnumSubscriptionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubscriptionStatus[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'ModuleKey'
   */
  export type EnumModuleKeyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ModuleKey'>
    


  /**
   * Reference to a field of type 'ModuleKey[]'
   */
  export type ListEnumModuleKeyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ModuleKey[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'AdminRole'
   */
  export type EnumAdminRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AdminRole'>
    


  /**
   * Reference to a field of type 'AdminRole[]'
   */
  export type ListEnumAdminRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AdminRole[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: UuidFilter<"Tenant"> | string
    slug?: StringFilter<"Tenant"> | string
    companyName?: StringFilter<"Tenant"> | string
    companyDocument?: StringFilter<"Tenant"> | string
    status?: EnumTenantStatusFilter<"Tenant"> | $Enums.TenantStatus
    databaseHost?: StringFilter<"Tenant"> | string
    databasePort?: IntFilter<"Tenant"> | number
    databaseName?: StringFilter<"Tenant"> | string
    databaseUser?: StringFilter<"Tenant"> | string
    databasePassword?: StringFilter<"Tenant"> | string
    subdomain?: StringNullableFilter<"Tenant"> | string | null
    customDomain?: StringNullableFilter<"Tenant"> | string | null
    adminSubdomain?: StringNullableFilter<"Tenant"> | string | null
    maxUsers?: IntFilter<"Tenant"> | number
    maxAdmins?: IntFilter<"Tenant"> | number
    maxStorageGB?: IntFilter<"Tenant"> | number
    subscriptionPlan?: EnumSubscriptionPlanFilter<"Tenant"> | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFilter<"Tenant"> | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFilter<"Tenant"> | Decimal | DecimalJsLike | number | string
    trialEndsAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    nextBillingDate?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    lastBillingDate?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    totalBilled?: DecimalFilter<"Tenant"> | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFilter<"Tenant"> | Decimal | DecimalJsLike | number | string
    contactName?: StringFilter<"Tenant"> | string
    contactEmail?: StringFilter<"Tenant"> | string
    contactPhone?: StringFilter<"Tenant"> | string
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    branding?: XOR<TenantBrandingNullableScalarRelationFilter, TenantBrandingWhereInput> | null
    modules?: TenantModuleListRelationFilter
    admins?: TenantAdminListRelationFilter
    apiKeys?: TenantApiKeyListRelationFilter
    usageStats?: TenantUsageStatsListRelationFilter
    stats?: XOR<TenantStatsNullableScalarRelationFilter, TenantStatsWhereInput> | null
    cashbackConfig?: XOR<TenantCashbackConfigNullableScalarRelationFilter, TenantCashbackConfigWhereInput> | null
    withdrawalConfig?: XOR<TenantWithdrawalConfigNullableScalarRelationFilter, TenantWithdrawalConfigWhereInput> | null
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    slug?: SortOrder
    companyName?: SortOrder
    companyDocument?: SortOrder
    status?: SortOrder
    databaseHost?: SortOrder
    databasePort?: SortOrder
    databaseName?: SortOrder
    databaseUser?: SortOrder
    databasePassword?: SortOrder
    subdomain?: SortOrderInput | SortOrder
    customDomain?: SortOrderInput | SortOrder
    adminSubdomain?: SortOrderInput | SortOrder
    maxUsers?: SortOrder
    maxAdmins?: SortOrder
    maxStorageGB?: SortOrder
    subscriptionPlan?: SortOrder
    subscriptionStatus?: SortOrder
    monthlyFee?: SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    nextBillingDate?: SortOrderInput | SortOrder
    lastBillingDate?: SortOrderInput | SortOrder
    totalBilled?: SortOrder
    outstandingBalance?: SortOrder
    contactName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    branding?: TenantBrandingOrderByWithRelationInput
    modules?: TenantModuleOrderByRelationAggregateInput
    admins?: TenantAdminOrderByRelationAggregateInput
    apiKeys?: TenantApiKeyOrderByRelationAggregateInput
    usageStats?: TenantUsageStatsOrderByRelationAggregateInput
    stats?: TenantStatsOrderByWithRelationInput
    cashbackConfig?: TenantCashbackConfigOrderByWithRelationInput
    withdrawalConfig?: TenantWithdrawalConfigOrderByWithRelationInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    companyDocument?: string
    subdomain?: string
    customDomain?: string
    adminSubdomain?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    companyName?: StringFilter<"Tenant"> | string
    status?: EnumTenantStatusFilter<"Tenant"> | $Enums.TenantStatus
    databaseHost?: StringFilter<"Tenant"> | string
    databasePort?: IntFilter<"Tenant"> | number
    databaseName?: StringFilter<"Tenant"> | string
    databaseUser?: StringFilter<"Tenant"> | string
    databasePassword?: StringFilter<"Tenant"> | string
    maxUsers?: IntFilter<"Tenant"> | number
    maxAdmins?: IntFilter<"Tenant"> | number
    maxStorageGB?: IntFilter<"Tenant"> | number
    subscriptionPlan?: EnumSubscriptionPlanFilter<"Tenant"> | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFilter<"Tenant"> | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFilter<"Tenant"> | Decimal | DecimalJsLike | number | string
    trialEndsAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    nextBillingDate?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    lastBillingDate?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    totalBilled?: DecimalFilter<"Tenant"> | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFilter<"Tenant"> | Decimal | DecimalJsLike | number | string
    contactName?: StringFilter<"Tenant"> | string
    contactEmail?: StringFilter<"Tenant"> | string
    contactPhone?: StringFilter<"Tenant"> | string
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    branding?: XOR<TenantBrandingNullableScalarRelationFilter, TenantBrandingWhereInput> | null
    modules?: TenantModuleListRelationFilter
    admins?: TenantAdminListRelationFilter
    apiKeys?: TenantApiKeyListRelationFilter
    usageStats?: TenantUsageStatsListRelationFilter
    stats?: XOR<TenantStatsNullableScalarRelationFilter, TenantStatsWhereInput> | null
    cashbackConfig?: XOR<TenantCashbackConfigNullableScalarRelationFilter, TenantCashbackConfigWhereInput> | null
    withdrawalConfig?: XOR<TenantWithdrawalConfigNullableScalarRelationFilter, TenantWithdrawalConfigWhereInput> | null
  }, "id" | "slug" | "companyDocument" | "subdomain" | "customDomain" | "adminSubdomain">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    slug?: SortOrder
    companyName?: SortOrder
    companyDocument?: SortOrder
    status?: SortOrder
    databaseHost?: SortOrder
    databasePort?: SortOrder
    databaseName?: SortOrder
    databaseUser?: SortOrder
    databasePassword?: SortOrder
    subdomain?: SortOrderInput | SortOrder
    customDomain?: SortOrderInput | SortOrder
    adminSubdomain?: SortOrderInput | SortOrder
    maxUsers?: SortOrder
    maxAdmins?: SortOrder
    maxStorageGB?: SortOrder
    subscriptionPlan?: SortOrder
    subscriptionStatus?: SortOrder
    monthlyFee?: SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    nextBillingDate?: SortOrderInput | SortOrder
    lastBillingDate?: SortOrderInput | SortOrder
    totalBilled?: SortOrder
    outstandingBalance?: SortOrder
    contactName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantCountOrderByAggregateInput
    _avg?: TenantAvgOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
    _sum?: TenantSumOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Tenant"> | string
    slug?: StringWithAggregatesFilter<"Tenant"> | string
    companyName?: StringWithAggregatesFilter<"Tenant"> | string
    companyDocument?: StringWithAggregatesFilter<"Tenant"> | string
    status?: EnumTenantStatusWithAggregatesFilter<"Tenant"> | $Enums.TenantStatus
    databaseHost?: StringWithAggregatesFilter<"Tenant"> | string
    databasePort?: IntWithAggregatesFilter<"Tenant"> | number
    databaseName?: StringWithAggregatesFilter<"Tenant"> | string
    databaseUser?: StringWithAggregatesFilter<"Tenant"> | string
    databasePassword?: StringWithAggregatesFilter<"Tenant"> | string
    subdomain?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    customDomain?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    adminSubdomain?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    maxUsers?: IntWithAggregatesFilter<"Tenant"> | number
    maxAdmins?: IntWithAggregatesFilter<"Tenant"> | number
    maxStorageGB?: IntWithAggregatesFilter<"Tenant"> | number
    subscriptionPlan?: EnumSubscriptionPlanWithAggregatesFilter<"Tenant"> | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusWithAggregatesFilter<"Tenant"> | $Enums.SubscriptionStatus
    monthlyFee?: DecimalWithAggregatesFilter<"Tenant"> | Decimal | DecimalJsLike | number | string
    trialEndsAt?: DateTimeNullableWithAggregatesFilter<"Tenant"> | Date | string | null
    nextBillingDate?: DateTimeNullableWithAggregatesFilter<"Tenant"> | Date | string | null
    lastBillingDate?: DateTimeNullableWithAggregatesFilter<"Tenant"> | Date | string | null
    totalBilled?: DecimalWithAggregatesFilter<"Tenant"> | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalWithAggregatesFilter<"Tenant"> | Decimal | DecimalJsLike | number | string
    contactName?: StringWithAggregatesFilter<"Tenant"> | string
    contactEmail?: StringWithAggregatesFilter<"Tenant"> | string
    contactPhone?: StringWithAggregatesFilter<"Tenant"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
  }

  export type TenantBrandingWhereInput = {
    AND?: TenantBrandingWhereInput | TenantBrandingWhereInput[]
    OR?: TenantBrandingWhereInput[]
    NOT?: TenantBrandingWhereInput | TenantBrandingWhereInput[]
    id?: UuidFilter<"TenantBranding"> | string
    tenantId?: UuidFilter<"TenantBranding"> | string
    logoUrl?: StringNullableFilter<"TenantBranding"> | string | null
    logoIconUrl?: StringNullableFilter<"TenantBranding"> | string | null
    faviconUrl?: StringNullableFilter<"TenantBranding"> | string | null
    primaryColor?: StringFilter<"TenantBranding"> | string
    secondaryColor?: StringFilter<"TenantBranding"> | string
    accentColor?: StringFilter<"TenantBranding"> | string
    backgroundColor?: StringFilter<"TenantBranding"> | string
    textColor?: StringFilter<"TenantBranding"> | string
    appName?: StringFilter<"TenantBranding"> | string
    appDescription?: StringNullableFilter<"TenantBranding"> | string | null
    appStoreUrl?: StringNullableFilter<"TenantBranding"> | string | null
    playStoreUrl?: StringNullableFilter<"TenantBranding"> | string | null
    createdAt?: DateTimeFilter<"TenantBranding"> | Date | string
    updatedAt?: DateTimeFilter<"TenantBranding"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type TenantBrandingOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    logoUrl?: SortOrderInput | SortOrder
    logoIconUrl?: SortOrderInput | SortOrder
    faviconUrl?: SortOrderInput | SortOrder
    primaryColor?: SortOrder
    secondaryColor?: SortOrder
    accentColor?: SortOrder
    backgroundColor?: SortOrder
    textColor?: SortOrder
    appName?: SortOrder
    appDescription?: SortOrderInput | SortOrder
    appStoreUrl?: SortOrderInput | SortOrder
    playStoreUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type TenantBrandingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId?: string
    AND?: TenantBrandingWhereInput | TenantBrandingWhereInput[]
    OR?: TenantBrandingWhereInput[]
    NOT?: TenantBrandingWhereInput | TenantBrandingWhereInput[]
    logoUrl?: StringNullableFilter<"TenantBranding"> | string | null
    logoIconUrl?: StringNullableFilter<"TenantBranding"> | string | null
    faviconUrl?: StringNullableFilter<"TenantBranding"> | string | null
    primaryColor?: StringFilter<"TenantBranding"> | string
    secondaryColor?: StringFilter<"TenantBranding"> | string
    accentColor?: StringFilter<"TenantBranding"> | string
    backgroundColor?: StringFilter<"TenantBranding"> | string
    textColor?: StringFilter<"TenantBranding"> | string
    appName?: StringFilter<"TenantBranding"> | string
    appDescription?: StringNullableFilter<"TenantBranding"> | string | null
    appStoreUrl?: StringNullableFilter<"TenantBranding"> | string | null
    playStoreUrl?: StringNullableFilter<"TenantBranding"> | string | null
    createdAt?: DateTimeFilter<"TenantBranding"> | Date | string
    updatedAt?: DateTimeFilter<"TenantBranding"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id" | "tenantId">

  export type TenantBrandingOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    logoUrl?: SortOrderInput | SortOrder
    logoIconUrl?: SortOrderInput | SortOrder
    faviconUrl?: SortOrderInput | SortOrder
    primaryColor?: SortOrder
    secondaryColor?: SortOrder
    accentColor?: SortOrder
    backgroundColor?: SortOrder
    textColor?: SortOrder
    appName?: SortOrder
    appDescription?: SortOrderInput | SortOrder
    appStoreUrl?: SortOrderInput | SortOrder
    playStoreUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantBrandingCountOrderByAggregateInput
    _max?: TenantBrandingMaxOrderByAggregateInput
    _min?: TenantBrandingMinOrderByAggregateInput
  }

  export type TenantBrandingScalarWhereWithAggregatesInput = {
    AND?: TenantBrandingScalarWhereWithAggregatesInput | TenantBrandingScalarWhereWithAggregatesInput[]
    OR?: TenantBrandingScalarWhereWithAggregatesInput[]
    NOT?: TenantBrandingScalarWhereWithAggregatesInput | TenantBrandingScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"TenantBranding"> | string
    tenantId?: UuidWithAggregatesFilter<"TenantBranding"> | string
    logoUrl?: StringNullableWithAggregatesFilter<"TenantBranding"> | string | null
    logoIconUrl?: StringNullableWithAggregatesFilter<"TenantBranding"> | string | null
    faviconUrl?: StringNullableWithAggregatesFilter<"TenantBranding"> | string | null
    primaryColor?: StringWithAggregatesFilter<"TenantBranding"> | string
    secondaryColor?: StringWithAggregatesFilter<"TenantBranding"> | string
    accentColor?: StringWithAggregatesFilter<"TenantBranding"> | string
    backgroundColor?: StringWithAggregatesFilter<"TenantBranding"> | string
    textColor?: StringWithAggregatesFilter<"TenantBranding"> | string
    appName?: StringWithAggregatesFilter<"TenantBranding"> | string
    appDescription?: StringNullableWithAggregatesFilter<"TenantBranding"> | string | null
    appStoreUrl?: StringNullableWithAggregatesFilter<"TenantBranding"> | string | null
    playStoreUrl?: StringNullableWithAggregatesFilter<"TenantBranding"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TenantBranding"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantBranding"> | Date | string
  }

  export type TenantModuleWhereInput = {
    AND?: TenantModuleWhereInput | TenantModuleWhereInput[]
    OR?: TenantModuleWhereInput[]
    NOT?: TenantModuleWhereInput | TenantModuleWhereInput[]
    id?: UuidFilter<"TenantModule"> | string
    tenantId?: UuidFilter<"TenantModule"> | string
    moduleKey?: EnumModuleKeyFilter<"TenantModule"> | $Enums.ModuleKey
    isEnabled?: BoolFilter<"TenantModule"> | boolean
    isEnabledByDefault?: BoolFilter<"TenantModule"> | boolean
    config?: JsonNullableFilter<"TenantModule">
    displayName?: StringFilter<"TenantModule"> | string
    description?: StringNullableFilter<"TenantModule"> | string | null
    sortOrder?: IntFilter<"TenantModule"> | number
    createdAt?: DateTimeFilter<"TenantModule"> | Date | string
    updatedAt?: DateTimeFilter<"TenantModule"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type TenantModuleOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleKey?: SortOrder
    isEnabled?: SortOrder
    isEnabledByDefault?: SortOrder
    config?: SortOrderInput | SortOrder
    displayName?: SortOrder
    description?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type TenantModuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_moduleKey?: TenantModuleTenantIdModuleKeyCompoundUniqueInput
    AND?: TenantModuleWhereInput | TenantModuleWhereInput[]
    OR?: TenantModuleWhereInput[]
    NOT?: TenantModuleWhereInput | TenantModuleWhereInput[]
    tenantId?: UuidFilter<"TenantModule"> | string
    moduleKey?: EnumModuleKeyFilter<"TenantModule"> | $Enums.ModuleKey
    isEnabled?: BoolFilter<"TenantModule"> | boolean
    isEnabledByDefault?: BoolFilter<"TenantModule"> | boolean
    config?: JsonNullableFilter<"TenantModule">
    displayName?: StringFilter<"TenantModule"> | string
    description?: StringNullableFilter<"TenantModule"> | string | null
    sortOrder?: IntFilter<"TenantModule"> | number
    createdAt?: DateTimeFilter<"TenantModule"> | Date | string
    updatedAt?: DateTimeFilter<"TenantModule"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id" | "tenantId_moduleKey">

  export type TenantModuleOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleKey?: SortOrder
    isEnabled?: SortOrder
    isEnabledByDefault?: SortOrder
    config?: SortOrderInput | SortOrder
    displayName?: SortOrder
    description?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantModuleCountOrderByAggregateInput
    _avg?: TenantModuleAvgOrderByAggregateInput
    _max?: TenantModuleMaxOrderByAggregateInput
    _min?: TenantModuleMinOrderByAggregateInput
    _sum?: TenantModuleSumOrderByAggregateInput
  }

  export type TenantModuleScalarWhereWithAggregatesInput = {
    AND?: TenantModuleScalarWhereWithAggregatesInput | TenantModuleScalarWhereWithAggregatesInput[]
    OR?: TenantModuleScalarWhereWithAggregatesInput[]
    NOT?: TenantModuleScalarWhereWithAggregatesInput | TenantModuleScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"TenantModule"> | string
    tenantId?: UuidWithAggregatesFilter<"TenantModule"> | string
    moduleKey?: EnumModuleKeyWithAggregatesFilter<"TenantModule"> | $Enums.ModuleKey
    isEnabled?: BoolWithAggregatesFilter<"TenantModule"> | boolean
    isEnabledByDefault?: BoolWithAggregatesFilter<"TenantModule"> | boolean
    config?: JsonNullableWithAggregatesFilter<"TenantModule">
    displayName?: StringWithAggregatesFilter<"TenantModule"> | string
    description?: StringNullableWithAggregatesFilter<"TenantModule"> | string | null
    sortOrder?: IntWithAggregatesFilter<"TenantModule"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TenantModule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantModule"> | Date | string
  }

  export type TenantStatsWhereInput = {
    AND?: TenantStatsWhereInput | TenantStatsWhereInput[]
    OR?: TenantStatsWhereInput[]
    NOT?: TenantStatsWhereInput | TenantStatsWhereInput[]
    id?: UuidFilter<"TenantStats"> | string
    tenantId?: UuidFilter<"TenantStats"> | string
    totalUsers?: IntFilter<"TenantStats"> | number
    totalConsumers?: IntFilter<"TenantStats"> | number
    totalMerchants?: IntFilter<"TenantStats"> | number
    activeUsers30d?: IntFilter<"TenantStats"> | number
    totalPurchases?: IntFilter<"TenantStats"> | number
    totalRevenue?: DecimalFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFilter<"TenantStats"> | number
    revenue30d?: DecimalFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFilter<"TenantStats"> | number
    cashback30d?: DecimalFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"TenantStats"> | Date | string
    updatedAt?: DateTimeFilter<"TenantStats"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type TenantStatsOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    activeUsers30d?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type TenantStatsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId?: string
    AND?: TenantStatsWhereInput | TenantStatsWhereInput[]
    OR?: TenantStatsWhereInput[]
    NOT?: TenantStatsWhereInput | TenantStatsWhereInput[]
    totalUsers?: IntFilter<"TenantStats"> | number
    totalConsumers?: IntFilter<"TenantStats"> | number
    totalMerchants?: IntFilter<"TenantStats"> | number
    activeUsers30d?: IntFilter<"TenantStats"> | number
    totalPurchases?: IntFilter<"TenantStats"> | number
    totalRevenue?: DecimalFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFilter<"TenantStats"> | number
    revenue30d?: DecimalFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFilter<"TenantStats"> | number
    cashback30d?: DecimalFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"TenantStats"> | Date | string
    updatedAt?: DateTimeFilter<"TenantStats"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id" | "tenantId">

  export type TenantStatsOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    activeUsers30d?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantStatsCountOrderByAggregateInput
    _avg?: TenantStatsAvgOrderByAggregateInput
    _max?: TenantStatsMaxOrderByAggregateInput
    _min?: TenantStatsMinOrderByAggregateInput
    _sum?: TenantStatsSumOrderByAggregateInput
  }

  export type TenantStatsScalarWhereWithAggregatesInput = {
    AND?: TenantStatsScalarWhereWithAggregatesInput | TenantStatsScalarWhereWithAggregatesInput[]
    OR?: TenantStatsScalarWhereWithAggregatesInput[]
    NOT?: TenantStatsScalarWhereWithAggregatesInput | TenantStatsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"TenantStats"> | string
    tenantId?: UuidWithAggregatesFilter<"TenantStats"> | string
    totalUsers?: IntWithAggregatesFilter<"TenantStats"> | number
    totalConsumers?: IntWithAggregatesFilter<"TenantStats"> | number
    totalMerchants?: IntWithAggregatesFilter<"TenantStats"> | number
    activeUsers30d?: IntWithAggregatesFilter<"TenantStats"> | number
    totalPurchases?: IntWithAggregatesFilter<"TenantStats"> | number
    totalRevenue?: DecimalWithAggregatesFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalWithAggregatesFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalWithAggregatesFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    totalProducts?: IntWithAggregatesFilter<"TenantStats"> | number
    revenue30d?: DecimalWithAggregatesFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    purchases30d?: IntWithAggregatesFilter<"TenantStats"> | number
    cashback30d?: DecimalWithAggregatesFilter<"TenantStats"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"TenantStats"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantStats"> | Date | string
  }

  export type GlobalStatsWhereInput = {
    AND?: GlobalStatsWhereInput | GlobalStatsWhereInput[]
    OR?: GlobalStatsWhereInput[]
    NOT?: GlobalStatsWhereInput | GlobalStatsWhereInput[]
    id?: UuidFilter<"GlobalStats"> | string
    date?: DateTimeFilter<"GlobalStats"> | Date | string
    totalTenants?: IntFilter<"GlobalStats"> | number
    totalUsers?: IntFilter<"GlobalStats"> | number
    totalConsumers?: IntFilter<"GlobalStats"> | number
    totalMerchants?: IntFilter<"GlobalStats"> | number
    totalPurchases?: IntFilter<"GlobalStats"> | number
    totalRevenue?: DecimalFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFilter<"GlobalStats"> | number
    activeUsers30d?: IntFilter<"GlobalStats"> | number
    revenue30d?: DecimalFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFilter<"GlobalStats"> | number
    cashback30d?: DecimalFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    newTenants?: IntFilter<"GlobalStats"> | number
    newUsers?: IntFilter<"GlobalStats"> | number
    churnedTenants?: IntFilter<"GlobalStats"> | number
    createdAt?: DateTimeFilter<"GlobalStats"> | Date | string
  }

  export type GlobalStatsOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    totalTenants?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    activeUsers30d?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    newTenants?: SortOrder
    newUsers?: SortOrder
    churnedTenants?: SortOrder
    createdAt?: SortOrder
  }

  export type GlobalStatsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    date?: Date | string
    AND?: GlobalStatsWhereInput | GlobalStatsWhereInput[]
    OR?: GlobalStatsWhereInput[]
    NOT?: GlobalStatsWhereInput | GlobalStatsWhereInput[]
    totalTenants?: IntFilter<"GlobalStats"> | number
    totalUsers?: IntFilter<"GlobalStats"> | number
    totalConsumers?: IntFilter<"GlobalStats"> | number
    totalMerchants?: IntFilter<"GlobalStats"> | number
    totalPurchases?: IntFilter<"GlobalStats"> | number
    totalRevenue?: DecimalFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFilter<"GlobalStats"> | number
    activeUsers30d?: IntFilter<"GlobalStats"> | number
    revenue30d?: DecimalFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFilter<"GlobalStats"> | number
    cashback30d?: DecimalFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    newTenants?: IntFilter<"GlobalStats"> | number
    newUsers?: IntFilter<"GlobalStats"> | number
    churnedTenants?: IntFilter<"GlobalStats"> | number
    createdAt?: DateTimeFilter<"GlobalStats"> | Date | string
  }, "id" | "date">

  export type GlobalStatsOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    totalTenants?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    activeUsers30d?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    newTenants?: SortOrder
    newUsers?: SortOrder
    churnedTenants?: SortOrder
    createdAt?: SortOrder
    _count?: GlobalStatsCountOrderByAggregateInput
    _avg?: GlobalStatsAvgOrderByAggregateInput
    _max?: GlobalStatsMaxOrderByAggregateInput
    _min?: GlobalStatsMinOrderByAggregateInput
    _sum?: GlobalStatsSumOrderByAggregateInput
  }

  export type GlobalStatsScalarWhereWithAggregatesInput = {
    AND?: GlobalStatsScalarWhereWithAggregatesInput | GlobalStatsScalarWhereWithAggregatesInput[]
    OR?: GlobalStatsScalarWhereWithAggregatesInput[]
    NOT?: GlobalStatsScalarWhereWithAggregatesInput | GlobalStatsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"GlobalStats"> | string
    date?: DateTimeWithAggregatesFilter<"GlobalStats"> | Date | string
    totalTenants?: IntWithAggregatesFilter<"GlobalStats"> | number
    totalUsers?: IntWithAggregatesFilter<"GlobalStats"> | number
    totalConsumers?: IntWithAggregatesFilter<"GlobalStats"> | number
    totalMerchants?: IntWithAggregatesFilter<"GlobalStats"> | number
    totalPurchases?: IntWithAggregatesFilter<"GlobalStats"> | number
    totalRevenue?: DecimalWithAggregatesFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalWithAggregatesFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalWithAggregatesFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    totalProducts?: IntWithAggregatesFilter<"GlobalStats"> | number
    activeUsers30d?: IntWithAggregatesFilter<"GlobalStats"> | number
    revenue30d?: DecimalWithAggregatesFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    purchases30d?: IntWithAggregatesFilter<"GlobalStats"> | number
    cashback30d?: DecimalWithAggregatesFilter<"GlobalStats"> | Decimal | DecimalJsLike | number | string
    newTenants?: IntWithAggregatesFilter<"GlobalStats"> | number
    newUsers?: IntWithAggregatesFilter<"GlobalStats"> | number
    churnedTenants?: IntWithAggregatesFilter<"GlobalStats"> | number
    createdAt?: DateTimeWithAggregatesFilter<"GlobalStats"> | Date | string
  }

  export type TenantCashbackConfigWhereInput = {
    AND?: TenantCashbackConfigWhereInput | TenantCashbackConfigWhereInput[]
    OR?: TenantCashbackConfigWhereInput[]
    NOT?: TenantCashbackConfigWhereInput | TenantCashbackConfigWhereInput[]
    id?: UuidFilter<"TenantCashbackConfig"> | string
    tenantId?: UuidFilter<"TenantCashbackConfig"> | string
    consumerPercent?: DecimalFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"TenantCashbackConfig"> | Date | string
    updatedAt?: DateTimeFilter<"TenantCashbackConfig"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type TenantCashbackConfigOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type TenantCashbackConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId?: string
    AND?: TenantCashbackConfigWhereInput | TenantCashbackConfigWhereInput[]
    OR?: TenantCashbackConfigWhereInput[]
    NOT?: TenantCashbackConfigWhereInput | TenantCashbackConfigWhereInput[]
    consumerPercent?: DecimalFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"TenantCashbackConfig"> | Date | string
    updatedAt?: DateTimeFilter<"TenantCashbackConfig"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id" | "tenantId">

  export type TenantCashbackConfigOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantCashbackConfigCountOrderByAggregateInput
    _avg?: TenantCashbackConfigAvgOrderByAggregateInput
    _max?: TenantCashbackConfigMaxOrderByAggregateInput
    _min?: TenantCashbackConfigMinOrderByAggregateInput
    _sum?: TenantCashbackConfigSumOrderByAggregateInput
  }

  export type TenantCashbackConfigScalarWhereWithAggregatesInput = {
    AND?: TenantCashbackConfigScalarWhereWithAggregatesInput | TenantCashbackConfigScalarWhereWithAggregatesInput[]
    OR?: TenantCashbackConfigScalarWhereWithAggregatesInput[]
    NOT?: TenantCashbackConfigScalarWhereWithAggregatesInput | TenantCashbackConfigScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"TenantCashbackConfig"> | string
    tenantId?: UuidWithAggregatesFilter<"TenantCashbackConfig"> | string
    consumerPercent?: DecimalWithAggregatesFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalWithAggregatesFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalWithAggregatesFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalWithAggregatesFilter<"TenantCashbackConfig"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"TenantCashbackConfig"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantCashbackConfig"> | Date | string
  }

  export type TenantWithdrawalConfigWhereInput = {
    AND?: TenantWithdrawalConfigWhereInput | TenantWithdrawalConfigWhereInput[]
    OR?: TenantWithdrawalConfigWhereInput[]
    NOT?: TenantWithdrawalConfigWhereInput | TenantWithdrawalConfigWhereInput[]
    id?: UuidFilter<"TenantWithdrawalConfig"> | string
    tenantId?: UuidFilter<"TenantWithdrawalConfig"> | string
    withdrawalFeePercent?: DecimalFilter<"TenantWithdrawalConfig"> | Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: DecimalFilter<"TenantWithdrawalConfig"> | Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: DecimalFilter<"TenantWithdrawalConfig"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"TenantWithdrawalConfig"> | Date | string
    updatedAt?: DateTimeFilter<"TenantWithdrawalConfig"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type TenantWithdrawalConfigOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    withdrawalFeePercent?: SortOrder
    withdrawalFeeFixed?: SortOrder
    minWithdrawalAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type TenantWithdrawalConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId?: string
    AND?: TenantWithdrawalConfigWhereInput | TenantWithdrawalConfigWhereInput[]
    OR?: TenantWithdrawalConfigWhereInput[]
    NOT?: TenantWithdrawalConfigWhereInput | TenantWithdrawalConfigWhereInput[]
    withdrawalFeePercent?: DecimalFilter<"TenantWithdrawalConfig"> | Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: DecimalFilter<"TenantWithdrawalConfig"> | Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: DecimalFilter<"TenantWithdrawalConfig"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"TenantWithdrawalConfig"> | Date | string
    updatedAt?: DateTimeFilter<"TenantWithdrawalConfig"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id" | "tenantId">

  export type TenantWithdrawalConfigOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    withdrawalFeePercent?: SortOrder
    withdrawalFeeFixed?: SortOrder
    minWithdrawalAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantWithdrawalConfigCountOrderByAggregateInput
    _avg?: TenantWithdrawalConfigAvgOrderByAggregateInput
    _max?: TenantWithdrawalConfigMaxOrderByAggregateInput
    _min?: TenantWithdrawalConfigMinOrderByAggregateInput
    _sum?: TenantWithdrawalConfigSumOrderByAggregateInput
  }

  export type TenantWithdrawalConfigScalarWhereWithAggregatesInput = {
    AND?: TenantWithdrawalConfigScalarWhereWithAggregatesInput | TenantWithdrawalConfigScalarWhereWithAggregatesInput[]
    OR?: TenantWithdrawalConfigScalarWhereWithAggregatesInput[]
    NOT?: TenantWithdrawalConfigScalarWhereWithAggregatesInput | TenantWithdrawalConfigScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"TenantWithdrawalConfig"> | string
    tenantId?: UuidWithAggregatesFilter<"TenantWithdrawalConfig"> | string
    withdrawalFeePercent?: DecimalWithAggregatesFilter<"TenantWithdrawalConfig"> | Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: DecimalWithAggregatesFilter<"TenantWithdrawalConfig"> | Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: DecimalWithAggregatesFilter<"TenantWithdrawalConfig"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"TenantWithdrawalConfig"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantWithdrawalConfig"> | Date | string
  }

  export type TenantAdminWhereInput = {
    AND?: TenantAdminWhereInput | TenantAdminWhereInput[]
    OR?: TenantAdminWhereInput[]
    NOT?: TenantAdminWhereInput | TenantAdminWhereInput[]
    id?: UuidFilter<"TenantAdmin"> | string
    tenantId?: UuidFilter<"TenantAdmin"> | string
    name?: StringFilter<"TenantAdmin"> | string
    email?: StringFilter<"TenantAdmin"> | string
    password?: StringFilter<"TenantAdmin"> | string
    role?: EnumAdminRoleFilter<"TenantAdmin"> | $Enums.AdminRole
    isActive?: BoolFilter<"TenantAdmin"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"TenantAdmin"> | Date | string | null
    createdAt?: DateTimeFilter<"TenantAdmin"> | Date | string
    updatedAt?: DateTimeFilter<"TenantAdmin"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type TenantAdminOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type TenantAdminWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_email?: TenantAdminTenantIdEmailCompoundUniqueInput
    AND?: TenantAdminWhereInput | TenantAdminWhereInput[]
    OR?: TenantAdminWhereInput[]
    NOT?: TenantAdminWhereInput | TenantAdminWhereInput[]
    tenantId?: UuidFilter<"TenantAdmin"> | string
    name?: StringFilter<"TenantAdmin"> | string
    email?: StringFilter<"TenantAdmin"> | string
    password?: StringFilter<"TenantAdmin"> | string
    role?: EnumAdminRoleFilter<"TenantAdmin"> | $Enums.AdminRole
    isActive?: BoolFilter<"TenantAdmin"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"TenantAdmin"> | Date | string | null
    createdAt?: DateTimeFilter<"TenantAdmin"> | Date | string
    updatedAt?: DateTimeFilter<"TenantAdmin"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id" | "tenantId_email">

  export type TenantAdminOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantAdminCountOrderByAggregateInput
    _max?: TenantAdminMaxOrderByAggregateInput
    _min?: TenantAdminMinOrderByAggregateInput
  }

  export type TenantAdminScalarWhereWithAggregatesInput = {
    AND?: TenantAdminScalarWhereWithAggregatesInput | TenantAdminScalarWhereWithAggregatesInput[]
    OR?: TenantAdminScalarWhereWithAggregatesInput[]
    NOT?: TenantAdminScalarWhereWithAggregatesInput | TenantAdminScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"TenantAdmin"> | string
    tenantId?: UuidWithAggregatesFilter<"TenantAdmin"> | string
    name?: StringWithAggregatesFilter<"TenantAdmin"> | string
    email?: StringWithAggregatesFilter<"TenantAdmin"> | string
    password?: StringWithAggregatesFilter<"TenantAdmin"> | string
    role?: EnumAdminRoleWithAggregatesFilter<"TenantAdmin"> | $Enums.AdminRole
    isActive?: BoolWithAggregatesFilter<"TenantAdmin"> | boolean
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"TenantAdmin"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TenantAdmin"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantAdmin"> | Date | string
  }

  export type SuperAdminWhereInput = {
    AND?: SuperAdminWhereInput | SuperAdminWhereInput[]
    OR?: SuperAdminWhereInput[]
    NOT?: SuperAdminWhereInput | SuperAdminWhereInput[]
    id?: UuidFilter<"SuperAdmin"> | string
    name?: StringFilter<"SuperAdmin"> | string
    email?: StringFilter<"SuperAdmin"> | string
    password?: StringFilter<"SuperAdmin"> | string
    permissions?: JsonFilter<"SuperAdmin">
    isActive?: BoolFilter<"SuperAdmin"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"SuperAdmin"> | Date | string | null
    createdAt?: DateTimeFilter<"SuperAdmin"> | Date | string
    updatedAt?: DateTimeFilter<"SuperAdmin"> | Date | string
  }

  export type SuperAdminOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    permissions?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SuperAdminWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: SuperAdminWhereInput | SuperAdminWhereInput[]
    OR?: SuperAdminWhereInput[]
    NOT?: SuperAdminWhereInput | SuperAdminWhereInput[]
    name?: StringFilter<"SuperAdmin"> | string
    password?: StringFilter<"SuperAdmin"> | string
    permissions?: JsonFilter<"SuperAdmin">
    isActive?: BoolFilter<"SuperAdmin"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"SuperAdmin"> | Date | string | null
    createdAt?: DateTimeFilter<"SuperAdmin"> | Date | string
    updatedAt?: DateTimeFilter<"SuperAdmin"> | Date | string
  }, "id" | "email">

  export type SuperAdminOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    permissions?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SuperAdminCountOrderByAggregateInput
    _max?: SuperAdminMaxOrderByAggregateInput
    _min?: SuperAdminMinOrderByAggregateInput
  }

  export type SuperAdminScalarWhereWithAggregatesInput = {
    AND?: SuperAdminScalarWhereWithAggregatesInput | SuperAdminScalarWhereWithAggregatesInput[]
    OR?: SuperAdminScalarWhereWithAggregatesInput[]
    NOT?: SuperAdminScalarWhereWithAggregatesInput | SuperAdminScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"SuperAdmin"> | string
    name?: StringWithAggregatesFilter<"SuperAdmin"> | string
    email?: StringWithAggregatesFilter<"SuperAdmin"> | string
    password?: StringWithAggregatesFilter<"SuperAdmin"> | string
    permissions?: JsonWithAggregatesFilter<"SuperAdmin">
    isActive?: BoolWithAggregatesFilter<"SuperAdmin"> | boolean
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"SuperAdmin"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SuperAdmin"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SuperAdmin"> | Date | string
  }

  export type TenantApiKeyWhereInput = {
    AND?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    OR?: TenantApiKeyWhereInput[]
    NOT?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    id?: UuidFilter<"TenantApiKey"> | string
    tenantId?: UuidFilter<"TenantApiKey"> | string
    keyName?: StringFilter<"TenantApiKey"> | string
    apiKey?: StringFilter<"TenantApiKey"> | string
    isActive?: BoolFilter<"TenantApiKey"> | boolean
    lastUsedAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
    createdAt?: DateTimeFilter<"TenantApiKey"> | Date | string
    expiresAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type TenantApiKeyOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    keyName?: SortOrder
    apiKey?: SortOrder
    isActive?: SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type TenantApiKeyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    apiKey?: string
    AND?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    OR?: TenantApiKeyWhereInput[]
    NOT?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    tenantId?: UuidFilter<"TenantApiKey"> | string
    keyName?: StringFilter<"TenantApiKey"> | string
    isActive?: BoolFilter<"TenantApiKey"> | boolean
    lastUsedAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
    createdAt?: DateTimeFilter<"TenantApiKey"> | Date | string
    expiresAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id" | "apiKey">

  export type TenantApiKeyOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    keyName?: SortOrder
    apiKey?: SortOrder
    isActive?: SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    _count?: TenantApiKeyCountOrderByAggregateInput
    _max?: TenantApiKeyMaxOrderByAggregateInput
    _min?: TenantApiKeyMinOrderByAggregateInput
  }

  export type TenantApiKeyScalarWhereWithAggregatesInput = {
    AND?: TenantApiKeyScalarWhereWithAggregatesInput | TenantApiKeyScalarWhereWithAggregatesInput[]
    OR?: TenantApiKeyScalarWhereWithAggregatesInput[]
    NOT?: TenantApiKeyScalarWhereWithAggregatesInput | TenantApiKeyScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"TenantApiKey"> | string
    tenantId?: UuidWithAggregatesFilter<"TenantApiKey"> | string
    keyName?: StringWithAggregatesFilter<"TenantApiKey"> | string
    apiKey?: StringWithAggregatesFilter<"TenantApiKey"> | string
    isActive?: BoolWithAggregatesFilter<"TenantApiKey"> | boolean
    lastUsedAt?: DateTimeNullableWithAggregatesFilter<"TenantApiKey"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TenantApiKey"> | Date | string
    expiresAt?: DateTimeNullableWithAggregatesFilter<"TenantApiKey"> | Date | string | null
  }

  export type TenantUsageStatsWhereInput = {
    AND?: TenantUsageStatsWhereInput | TenantUsageStatsWhereInput[]
    OR?: TenantUsageStatsWhereInput[]
    NOT?: TenantUsageStatsWhereInput | TenantUsageStatsWhereInput[]
    id?: UuidFilter<"TenantUsageStats"> | string
    tenantId?: UuidFilter<"TenantUsageStats"> | string
    date?: DateTimeFilter<"TenantUsageStats"> | Date | string
    apiCalls?: IntFilter<"TenantUsageStats"> | number
    storageUsedMB?: IntFilter<"TenantUsageStats"> | number
    activeUsers?: IntFilter<"TenantUsageStats"> | number
    createdAt?: DateTimeFilter<"TenantUsageStats"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type TenantUsageStatsOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    date?: SortOrder
    apiCalls?: SortOrder
    storageUsedMB?: SortOrder
    activeUsers?: SortOrder
    createdAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type TenantUsageStatsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_date?: TenantUsageStatsTenantIdDateCompoundUniqueInput
    AND?: TenantUsageStatsWhereInput | TenantUsageStatsWhereInput[]
    OR?: TenantUsageStatsWhereInput[]
    NOT?: TenantUsageStatsWhereInput | TenantUsageStatsWhereInput[]
    tenantId?: UuidFilter<"TenantUsageStats"> | string
    date?: DateTimeFilter<"TenantUsageStats"> | Date | string
    apiCalls?: IntFilter<"TenantUsageStats"> | number
    storageUsedMB?: IntFilter<"TenantUsageStats"> | number
    activeUsers?: IntFilter<"TenantUsageStats"> | number
    createdAt?: DateTimeFilter<"TenantUsageStats"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id" | "tenantId_date">

  export type TenantUsageStatsOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    date?: SortOrder
    apiCalls?: SortOrder
    storageUsedMB?: SortOrder
    activeUsers?: SortOrder
    createdAt?: SortOrder
    _count?: TenantUsageStatsCountOrderByAggregateInput
    _avg?: TenantUsageStatsAvgOrderByAggregateInput
    _max?: TenantUsageStatsMaxOrderByAggregateInput
    _min?: TenantUsageStatsMinOrderByAggregateInput
    _sum?: TenantUsageStatsSumOrderByAggregateInput
  }

  export type TenantUsageStatsScalarWhereWithAggregatesInput = {
    AND?: TenantUsageStatsScalarWhereWithAggregatesInput | TenantUsageStatsScalarWhereWithAggregatesInput[]
    OR?: TenantUsageStatsScalarWhereWithAggregatesInput[]
    NOT?: TenantUsageStatsScalarWhereWithAggregatesInput | TenantUsageStatsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"TenantUsageStats"> | string
    tenantId?: UuidWithAggregatesFilter<"TenantUsageStats"> | string
    date?: DateTimeWithAggregatesFilter<"TenantUsageStats"> | Date | string
    apiCalls?: IntWithAggregatesFilter<"TenantUsageStats"> | number
    storageUsedMB?: IntWithAggregatesFilter<"TenantUsageStats"> | number
    activeUsers?: IntWithAggregatesFilter<"TenantUsageStats"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TenantUsageStats"> | Date | string
  }

  export type TenantCreateInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingCreateNestedOneWithoutTenantInput
    modules?: TenantModuleCreateNestedManyWithoutTenantInput
    admins?: TenantAdminCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsCreateNestedManyWithoutTenantInput
    stats?: TenantStatsCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigCreateNestedOneWithoutTenantInput
  }

  export type TenantUncheckedCreateInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingUncheckedCreateNestedOneWithoutTenantInput
    modules?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    admins?: TenantAdminUncheckedCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyUncheckedCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsUncheckedCreateNestedManyWithoutTenantInput
    stats?: TenantStatsUncheckedCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigUncheckedCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedCreateNestedOneWithoutTenantInput
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUpdateOneWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUncheckedUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUncheckedUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUncheckedUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUncheckedUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUncheckedUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUncheckedUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedUpdateOneWithoutTenantNestedInput
  }

  export type TenantCreateManyInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantBrandingCreateInput = {
    id?: string
    logoUrl?: string | null
    logoIconUrl?: string | null
    faviconUrl?: string | null
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    backgroundColor?: string
    textColor?: string
    appName: string
    appDescription?: string | null
    appStoreUrl?: string | null
    playStoreUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutBrandingInput
  }

  export type TenantBrandingUncheckedCreateInput = {
    id?: string
    tenantId: string
    logoUrl?: string | null
    logoIconUrl?: string | null
    faviconUrl?: string | null
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    backgroundColor?: string
    textColor?: string
    appName: string
    appDescription?: string | null
    appStoreUrl?: string | null
    playStoreUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantBrandingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logoIconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    faviconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: StringFieldUpdateOperationsInput | string
    secondaryColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    backgroundColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    appName?: StringFieldUpdateOperationsInput | string
    appDescription?: NullableStringFieldUpdateOperationsInput | string | null
    appStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    playStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutBrandingNestedInput
  }

  export type TenantBrandingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logoIconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    faviconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: StringFieldUpdateOperationsInput | string
    secondaryColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    backgroundColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    appName?: StringFieldUpdateOperationsInput | string
    appDescription?: NullableStringFieldUpdateOperationsInput | string | null
    appStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    playStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantBrandingCreateManyInput = {
    id?: string
    tenantId: string
    logoUrl?: string | null
    logoIconUrl?: string | null
    faviconUrl?: string | null
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    backgroundColor?: string
    textColor?: string
    appName: string
    appDescription?: string | null
    appStoreUrl?: string | null
    playStoreUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantBrandingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logoIconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    faviconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: StringFieldUpdateOperationsInput | string
    secondaryColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    backgroundColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    appName?: StringFieldUpdateOperationsInput | string
    appDescription?: NullableStringFieldUpdateOperationsInput | string | null
    appStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    playStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantBrandingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logoIconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    faviconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: StringFieldUpdateOperationsInput | string
    secondaryColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    backgroundColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    appName?: StringFieldUpdateOperationsInput | string
    appDescription?: NullableStringFieldUpdateOperationsInput | string | null
    appStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    playStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleCreateInput = {
    id?: string
    moduleKey: $Enums.ModuleKey
    isEnabled?: boolean
    isEnabledByDefault?: boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName: string
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutModulesInput
  }

  export type TenantModuleUncheckedCreateInput = {
    id?: string
    tenantId: string
    moduleKey: $Enums.ModuleKey
    isEnabled?: boolean
    isEnabledByDefault?: boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName: string
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleKey?: EnumModuleKeyFieldUpdateOperationsInput | $Enums.ModuleKey
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    isEnabledByDefault?: BoolFieldUpdateOperationsInput | boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutModulesNestedInput
  }

  export type TenantModuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleKey?: EnumModuleKeyFieldUpdateOperationsInput | $Enums.ModuleKey
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    isEnabledByDefault?: BoolFieldUpdateOperationsInput | boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleCreateManyInput = {
    id?: string
    tenantId: string
    moduleKey: $Enums.ModuleKey
    isEnabled?: boolean
    isEnabledByDefault?: boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName: string
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleKey?: EnumModuleKeyFieldUpdateOperationsInput | $Enums.ModuleKey
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    isEnabledByDefault?: BoolFieldUpdateOperationsInput | boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleKey?: EnumModuleKeyFieldUpdateOperationsInput | $Enums.ModuleKey
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    isEnabledByDefault?: BoolFieldUpdateOperationsInput | boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantStatsCreateInput = {
    id?: string
    totalUsers?: number
    totalConsumers?: number
    totalMerchants?: number
    activeUsers30d?: number
    totalPurchases?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: Decimal | DecimalJsLike | number | string
    totalPlatformFees?: Decimal | DecimalJsLike | number | string
    totalProducts?: number
    revenue30d?: Decimal | DecimalJsLike | number | string
    purchases30d?: number
    cashback30d?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutStatsInput
  }

  export type TenantStatsUncheckedCreateInput = {
    id?: string
    tenantId: string
    totalUsers?: number
    totalConsumers?: number
    totalMerchants?: number
    activeUsers30d?: number
    totalPurchases?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: Decimal | DecimalJsLike | number | string
    totalPlatformFees?: Decimal | DecimalJsLike | number | string
    totalProducts?: number
    revenue30d?: Decimal | DecimalJsLike | number | string
    purchases30d?: number
    cashback30d?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantStatsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalUsers?: IntFieldUpdateOperationsInput | number
    totalConsumers?: IntFieldUpdateOperationsInput | number
    totalMerchants?: IntFieldUpdateOperationsInput | number
    activeUsers30d?: IntFieldUpdateOperationsInput | number
    totalPurchases?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    revenue30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFieldUpdateOperationsInput | number
    cashback30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutStatsNestedInput
  }

  export type TenantStatsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    totalUsers?: IntFieldUpdateOperationsInput | number
    totalConsumers?: IntFieldUpdateOperationsInput | number
    totalMerchants?: IntFieldUpdateOperationsInput | number
    activeUsers30d?: IntFieldUpdateOperationsInput | number
    totalPurchases?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    revenue30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFieldUpdateOperationsInput | number
    cashback30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantStatsCreateManyInput = {
    id?: string
    tenantId: string
    totalUsers?: number
    totalConsumers?: number
    totalMerchants?: number
    activeUsers30d?: number
    totalPurchases?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: Decimal | DecimalJsLike | number | string
    totalPlatformFees?: Decimal | DecimalJsLike | number | string
    totalProducts?: number
    revenue30d?: Decimal | DecimalJsLike | number | string
    purchases30d?: number
    cashback30d?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantStatsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalUsers?: IntFieldUpdateOperationsInput | number
    totalConsumers?: IntFieldUpdateOperationsInput | number
    totalMerchants?: IntFieldUpdateOperationsInput | number
    activeUsers30d?: IntFieldUpdateOperationsInput | number
    totalPurchases?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    revenue30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFieldUpdateOperationsInput | number
    cashback30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantStatsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    totalUsers?: IntFieldUpdateOperationsInput | number
    totalConsumers?: IntFieldUpdateOperationsInput | number
    totalMerchants?: IntFieldUpdateOperationsInput | number
    activeUsers30d?: IntFieldUpdateOperationsInput | number
    totalPurchases?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    revenue30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFieldUpdateOperationsInput | number
    cashback30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GlobalStatsCreateInput = {
    id?: string
    date: Date | string
    totalTenants?: number
    totalUsers?: number
    totalConsumers?: number
    totalMerchants?: number
    totalPurchases?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: Decimal | DecimalJsLike | number | string
    totalPlatformFees?: Decimal | DecimalJsLike | number | string
    totalProducts?: number
    activeUsers30d?: number
    revenue30d?: Decimal | DecimalJsLike | number | string
    purchases30d?: number
    cashback30d?: Decimal | DecimalJsLike | number | string
    newTenants?: number
    newUsers?: number
    churnedTenants?: number
    createdAt?: Date | string
  }

  export type GlobalStatsUncheckedCreateInput = {
    id?: string
    date: Date | string
    totalTenants?: number
    totalUsers?: number
    totalConsumers?: number
    totalMerchants?: number
    totalPurchases?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: Decimal | DecimalJsLike | number | string
    totalPlatformFees?: Decimal | DecimalJsLike | number | string
    totalProducts?: number
    activeUsers30d?: number
    revenue30d?: Decimal | DecimalJsLike | number | string
    purchases30d?: number
    cashback30d?: Decimal | DecimalJsLike | number | string
    newTenants?: number
    newUsers?: number
    churnedTenants?: number
    createdAt?: Date | string
  }

  export type GlobalStatsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalTenants?: IntFieldUpdateOperationsInput | number
    totalUsers?: IntFieldUpdateOperationsInput | number
    totalConsumers?: IntFieldUpdateOperationsInput | number
    totalMerchants?: IntFieldUpdateOperationsInput | number
    totalPurchases?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    activeUsers30d?: IntFieldUpdateOperationsInput | number
    revenue30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFieldUpdateOperationsInput | number
    cashback30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    newTenants?: IntFieldUpdateOperationsInput | number
    newUsers?: IntFieldUpdateOperationsInput | number
    churnedTenants?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GlobalStatsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalTenants?: IntFieldUpdateOperationsInput | number
    totalUsers?: IntFieldUpdateOperationsInput | number
    totalConsumers?: IntFieldUpdateOperationsInput | number
    totalMerchants?: IntFieldUpdateOperationsInput | number
    totalPurchases?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    activeUsers30d?: IntFieldUpdateOperationsInput | number
    revenue30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFieldUpdateOperationsInput | number
    cashback30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    newTenants?: IntFieldUpdateOperationsInput | number
    newUsers?: IntFieldUpdateOperationsInput | number
    churnedTenants?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GlobalStatsCreateManyInput = {
    id?: string
    date: Date | string
    totalTenants?: number
    totalUsers?: number
    totalConsumers?: number
    totalMerchants?: number
    totalPurchases?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: Decimal | DecimalJsLike | number | string
    totalPlatformFees?: Decimal | DecimalJsLike | number | string
    totalProducts?: number
    activeUsers30d?: number
    revenue30d?: Decimal | DecimalJsLike | number | string
    purchases30d?: number
    cashback30d?: Decimal | DecimalJsLike | number | string
    newTenants?: number
    newUsers?: number
    churnedTenants?: number
    createdAt?: Date | string
  }

  export type GlobalStatsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalTenants?: IntFieldUpdateOperationsInput | number
    totalUsers?: IntFieldUpdateOperationsInput | number
    totalConsumers?: IntFieldUpdateOperationsInput | number
    totalMerchants?: IntFieldUpdateOperationsInput | number
    totalPurchases?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    activeUsers30d?: IntFieldUpdateOperationsInput | number
    revenue30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFieldUpdateOperationsInput | number
    cashback30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    newTenants?: IntFieldUpdateOperationsInput | number
    newUsers?: IntFieldUpdateOperationsInput | number
    churnedTenants?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GlobalStatsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalTenants?: IntFieldUpdateOperationsInput | number
    totalUsers?: IntFieldUpdateOperationsInput | number
    totalConsumers?: IntFieldUpdateOperationsInput | number
    totalMerchants?: IntFieldUpdateOperationsInput | number
    totalPurchases?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    activeUsers30d?: IntFieldUpdateOperationsInput | number
    revenue30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFieldUpdateOperationsInput | number
    cashback30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    newTenants?: IntFieldUpdateOperationsInput | number
    newUsers?: IntFieldUpdateOperationsInput | number
    churnedTenants?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCashbackConfigCreateInput = {
    id?: string
    consumerPercent?: Decimal | DecimalJsLike | number | string
    clubPercent?: Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutCashbackConfigInput
  }

  export type TenantCashbackConfigUncheckedCreateInput = {
    id?: string
    tenantId: string
    consumerPercent?: Decimal | DecimalJsLike | number | string
    clubPercent?: Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantCashbackConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutCashbackConfigNestedInput
  }

  export type TenantCashbackConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCashbackConfigCreateManyInput = {
    id?: string
    tenantId: string
    consumerPercent?: Decimal | DecimalJsLike | number | string
    clubPercent?: Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantCashbackConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCashbackConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantWithdrawalConfigCreateInput = {
    id?: string
    withdrawalFeePercent?: Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutWithdrawalConfigInput
  }

  export type TenantWithdrawalConfigUncheckedCreateInput = {
    id?: string
    tenantId: string
    withdrawalFeePercent?: Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantWithdrawalConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    withdrawalFeePercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutWithdrawalConfigNestedInput
  }

  export type TenantWithdrawalConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    withdrawalFeePercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantWithdrawalConfigCreateManyInput = {
    id?: string
    tenantId: string
    withdrawalFeePercent?: Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantWithdrawalConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    withdrawalFeePercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantWithdrawalConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    withdrawalFeePercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAdminCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.AdminRole
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutAdminsInput
  }

  export type TenantAdminUncheckedCreateInput = {
    id?: string
    tenantId: string
    name: string
    email: string
    password: string
    role?: $Enums.AdminRole
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantAdminUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAdminRoleFieldUpdateOperationsInput | $Enums.AdminRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutAdminsNestedInput
  }

  export type TenantAdminUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAdminRoleFieldUpdateOperationsInput | $Enums.AdminRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAdminCreateManyInput = {
    id?: string
    tenantId: string
    name: string
    email: string
    password: string
    role?: $Enums.AdminRole
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantAdminUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAdminRoleFieldUpdateOperationsInput | $Enums.AdminRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAdminUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAdminRoleFieldUpdateOperationsInput | $Enums.AdminRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    permissions?: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SuperAdminUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    permissions?: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SuperAdminUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    permissions?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    permissions?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminCreateManyInput = {
    id?: string
    name: string
    email: string
    password: string
    permissions?: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SuperAdminUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    permissions?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SuperAdminUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    permissions?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantApiKeyCreateInput = {
    id?: string
    keyName: string
    apiKey: string
    isActive?: boolean
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    expiresAt?: Date | string | null
    tenant: TenantCreateNestedOneWithoutApiKeysInput
  }

  export type TenantApiKeyUncheckedCreateInput = {
    id?: string
    tenantId: string
    keyName: string
    apiKey: string
    isActive?: boolean
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    expiresAt?: Date | string | null
  }

  export type TenantApiKeyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyName?: StringFieldUpdateOperationsInput | string
    apiKey?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tenant?: TenantUpdateOneRequiredWithoutApiKeysNestedInput
  }

  export type TenantApiKeyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    keyName?: StringFieldUpdateOperationsInput | string
    apiKey?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantApiKeyCreateManyInput = {
    id?: string
    tenantId: string
    keyName: string
    apiKey: string
    isActive?: boolean
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    expiresAt?: Date | string | null
  }

  export type TenantApiKeyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyName?: StringFieldUpdateOperationsInput | string
    apiKey?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantApiKeyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    keyName?: StringFieldUpdateOperationsInput | string
    apiKey?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantUsageStatsCreateInput = {
    id?: string
    date: Date | string
    apiCalls?: number
    storageUsedMB?: number
    activeUsers?: number
    createdAt?: Date | string
    tenant: TenantCreateNestedOneWithoutUsageStatsInput
  }

  export type TenantUsageStatsUncheckedCreateInput = {
    id?: string
    tenantId: string
    date: Date | string
    apiCalls?: number
    storageUsedMB?: number
    activeUsers?: number
    createdAt?: Date | string
  }

  export type TenantUsageStatsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    apiCalls?: IntFieldUpdateOperationsInput | number
    storageUsedMB?: IntFieldUpdateOperationsInput | number
    activeUsers?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsageStatsNestedInput
  }

  export type TenantUsageStatsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    apiCalls?: IntFieldUpdateOperationsInput | number
    storageUsedMB?: IntFieldUpdateOperationsInput | number
    activeUsers?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageStatsCreateManyInput = {
    id?: string
    tenantId: string
    date: Date | string
    apiCalls?: number
    storageUsedMB?: number
    activeUsers?: number
    createdAt?: Date | string
  }

  export type TenantUsageStatsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    apiCalls?: IntFieldUpdateOperationsInput | number
    storageUsedMB?: IntFieldUpdateOperationsInput | number
    activeUsers?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageStatsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    apiCalls?: IntFieldUpdateOperationsInput | number
    storageUsedMB?: IntFieldUpdateOperationsInput | number
    activeUsers?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumTenantStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusFilter<$PrismaModel> | $Enums.TenantStatus
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumSubscriptionPlanFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionPlan | EnumSubscriptionPlanFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionPlanFilter<$PrismaModel> | $Enums.SubscriptionPlan
  }

  export type EnumSubscriptionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionStatus | EnumSubscriptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionStatusFilter<$PrismaModel> | $Enums.SubscriptionStatus
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type TenantBrandingNullableScalarRelationFilter = {
    is?: TenantBrandingWhereInput | null
    isNot?: TenantBrandingWhereInput | null
  }

  export type TenantModuleListRelationFilter = {
    every?: TenantModuleWhereInput
    some?: TenantModuleWhereInput
    none?: TenantModuleWhereInput
  }

  export type TenantAdminListRelationFilter = {
    every?: TenantAdminWhereInput
    some?: TenantAdminWhereInput
    none?: TenantAdminWhereInput
  }

  export type TenantApiKeyListRelationFilter = {
    every?: TenantApiKeyWhereInput
    some?: TenantApiKeyWhereInput
    none?: TenantApiKeyWhereInput
  }

  export type TenantUsageStatsListRelationFilter = {
    every?: TenantUsageStatsWhereInput
    some?: TenantUsageStatsWhereInput
    none?: TenantUsageStatsWhereInput
  }

  export type TenantStatsNullableScalarRelationFilter = {
    is?: TenantStatsWhereInput | null
    isNot?: TenantStatsWhereInput | null
  }

  export type TenantCashbackConfigNullableScalarRelationFilter = {
    is?: TenantCashbackConfigWhereInput | null
    isNot?: TenantCashbackConfigWhereInput | null
  }

  export type TenantWithdrawalConfigNullableScalarRelationFilter = {
    is?: TenantWithdrawalConfigWhereInput | null
    isNot?: TenantWithdrawalConfigWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type TenantModuleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantAdminOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantApiKeyOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantUsageStatsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    companyName?: SortOrder
    companyDocument?: SortOrder
    status?: SortOrder
    databaseHost?: SortOrder
    databasePort?: SortOrder
    databaseName?: SortOrder
    databaseUser?: SortOrder
    databasePassword?: SortOrder
    subdomain?: SortOrder
    customDomain?: SortOrder
    adminSubdomain?: SortOrder
    maxUsers?: SortOrder
    maxAdmins?: SortOrder
    maxStorageGB?: SortOrder
    subscriptionPlan?: SortOrder
    subscriptionStatus?: SortOrder
    monthlyFee?: SortOrder
    trialEndsAt?: SortOrder
    nextBillingDate?: SortOrder
    lastBillingDate?: SortOrder
    totalBilled?: SortOrder
    outstandingBalance?: SortOrder
    contactName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantAvgOrderByAggregateInput = {
    databasePort?: SortOrder
    maxUsers?: SortOrder
    maxAdmins?: SortOrder
    maxStorageGB?: SortOrder
    monthlyFee?: SortOrder
    totalBilled?: SortOrder
    outstandingBalance?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    companyName?: SortOrder
    companyDocument?: SortOrder
    status?: SortOrder
    databaseHost?: SortOrder
    databasePort?: SortOrder
    databaseName?: SortOrder
    databaseUser?: SortOrder
    databasePassword?: SortOrder
    subdomain?: SortOrder
    customDomain?: SortOrder
    adminSubdomain?: SortOrder
    maxUsers?: SortOrder
    maxAdmins?: SortOrder
    maxStorageGB?: SortOrder
    subscriptionPlan?: SortOrder
    subscriptionStatus?: SortOrder
    monthlyFee?: SortOrder
    trialEndsAt?: SortOrder
    nextBillingDate?: SortOrder
    lastBillingDate?: SortOrder
    totalBilled?: SortOrder
    outstandingBalance?: SortOrder
    contactName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    companyName?: SortOrder
    companyDocument?: SortOrder
    status?: SortOrder
    databaseHost?: SortOrder
    databasePort?: SortOrder
    databaseName?: SortOrder
    databaseUser?: SortOrder
    databasePassword?: SortOrder
    subdomain?: SortOrder
    customDomain?: SortOrder
    adminSubdomain?: SortOrder
    maxUsers?: SortOrder
    maxAdmins?: SortOrder
    maxStorageGB?: SortOrder
    subscriptionPlan?: SortOrder
    subscriptionStatus?: SortOrder
    monthlyFee?: SortOrder
    trialEndsAt?: SortOrder
    nextBillingDate?: SortOrder
    lastBillingDate?: SortOrder
    totalBilled?: SortOrder
    outstandingBalance?: SortOrder
    contactName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantSumOrderByAggregateInput = {
    databasePort?: SortOrder
    maxUsers?: SortOrder
    maxAdmins?: SortOrder
    maxStorageGB?: SortOrder
    monthlyFee?: SortOrder
    totalBilled?: SortOrder
    outstandingBalance?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumTenantStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel> | $Enums.TenantStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTenantStatusFilter<$PrismaModel>
    _max?: NestedEnumTenantStatusFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumSubscriptionPlanWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionPlan | EnumSubscriptionPlanFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionPlanWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionPlan
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSubscriptionPlanFilter<$PrismaModel>
    _max?: NestedEnumSubscriptionPlanFilter<$PrismaModel>
  }

  export type EnumSubscriptionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionStatus | EnumSubscriptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionStatusWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSubscriptionStatusFilter<$PrismaModel>
    _max?: NestedEnumSubscriptionStatusFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type TenantScalarRelationFilter = {
    is?: TenantWhereInput
    isNot?: TenantWhereInput
  }

  export type TenantBrandingCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    logoUrl?: SortOrder
    logoIconUrl?: SortOrder
    faviconUrl?: SortOrder
    primaryColor?: SortOrder
    secondaryColor?: SortOrder
    accentColor?: SortOrder
    backgroundColor?: SortOrder
    textColor?: SortOrder
    appName?: SortOrder
    appDescription?: SortOrder
    appStoreUrl?: SortOrder
    playStoreUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantBrandingMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    logoUrl?: SortOrder
    logoIconUrl?: SortOrder
    faviconUrl?: SortOrder
    primaryColor?: SortOrder
    secondaryColor?: SortOrder
    accentColor?: SortOrder
    backgroundColor?: SortOrder
    textColor?: SortOrder
    appName?: SortOrder
    appDescription?: SortOrder
    appStoreUrl?: SortOrder
    playStoreUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantBrandingMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    logoUrl?: SortOrder
    logoIconUrl?: SortOrder
    faviconUrl?: SortOrder
    primaryColor?: SortOrder
    secondaryColor?: SortOrder
    accentColor?: SortOrder
    backgroundColor?: SortOrder
    textColor?: SortOrder
    appName?: SortOrder
    appDescription?: SortOrder
    appStoreUrl?: SortOrder
    playStoreUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumModuleKeyFilter<$PrismaModel = never> = {
    equals?: $Enums.ModuleKey | EnumModuleKeyFieldRefInput<$PrismaModel>
    in?: $Enums.ModuleKey[] | ListEnumModuleKeyFieldRefInput<$PrismaModel>
    notIn?: $Enums.ModuleKey[] | ListEnumModuleKeyFieldRefInput<$PrismaModel>
    not?: NestedEnumModuleKeyFilter<$PrismaModel> | $Enums.ModuleKey
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type TenantModuleTenantIdModuleKeyCompoundUniqueInput = {
    tenantId: string
    moduleKey: $Enums.ModuleKey
  }

  export type TenantModuleCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleKey?: SortOrder
    isEnabled?: SortOrder
    isEnabledByDefault?: SortOrder
    config?: SortOrder
    displayName?: SortOrder
    description?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantModuleAvgOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type TenantModuleMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleKey?: SortOrder
    isEnabled?: SortOrder
    isEnabledByDefault?: SortOrder
    displayName?: SortOrder
    description?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantModuleMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleKey?: SortOrder
    isEnabled?: SortOrder
    isEnabledByDefault?: SortOrder
    displayName?: SortOrder
    description?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantModuleSumOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type EnumModuleKeyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ModuleKey | EnumModuleKeyFieldRefInput<$PrismaModel>
    in?: $Enums.ModuleKey[] | ListEnumModuleKeyFieldRefInput<$PrismaModel>
    notIn?: $Enums.ModuleKey[] | ListEnumModuleKeyFieldRefInput<$PrismaModel>
    not?: NestedEnumModuleKeyWithAggregatesFilter<$PrismaModel> | $Enums.ModuleKey
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumModuleKeyFilter<$PrismaModel>
    _max?: NestedEnumModuleKeyFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type TenantStatsCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    activeUsers30d?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantStatsAvgOrderByAggregateInput = {
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    activeUsers30d?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
  }

  export type TenantStatsMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    activeUsers30d?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantStatsMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    activeUsers30d?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantStatsSumOrderByAggregateInput = {
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    activeUsers30d?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
  }

  export type GlobalStatsCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalTenants?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    activeUsers30d?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    newTenants?: SortOrder
    newUsers?: SortOrder
    churnedTenants?: SortOrder
    createdAt?: SortOrder
  }

  export type GlobalStatsAvgOrderByAggregateInput = {
    totalTenants?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    activeUsers30d?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    newTenants?: SortOrder
    newUsers?: SortOrder
    churnedTenants?: SortOrder
  }

  export type GlobalStatsMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalTenants?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    activeUsers30d?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    newTenants?: SortOrder
    newUsers?: SortOrder
    churnedTenants?: SortOrder
    createdAt?: SortOrder
  }

  export type GlobalStatsMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalTenants?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    activeUsers30d?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    newTenants?: SortOrder
    newUsers?: SortOrder
    churnedTenants?: SortOrder
    createdAt?: SortOrder
  }

  export type GlobalStatsSumOrderByAggregateInput = {
    totalTenants?: SortOrder
    totalUsers?: SortOrder
    totalConsumers?: SortOrder
    totalMerchants?: SortOrder
    totalPurchases?: SortOrder
    totalRevenue?: SortOrder
    totalCashbackPaid?: SortOrder
    totalPlatformFees?: SortOrder
    totalProducts?: SortOrder
    activeUsers30d?: SortOrder
    revenue30d?: SortOrder
    purchases30d?: SortOrder
    cashback30d?: SortOrder
    newTenants?: SortOrder
    newUsers?: SortOrder
    churnedTenants?: SortOrder
  }

  export type TenantCashbackConfigCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantCashbackConfigAvgOrderByAggregateInput = {
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
  }

  export type TenantCashbackConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantCashbackConfigMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantCashbackConfigSumOrderByAggregateInput = {
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
  }

  export type TenantWithdrawalConfigCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    withdrawalFeePercent?: SortOrder
    withdrawalFeeFixed?: SortOrder
    minWithdrawalAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantWithdrawalConfigAvgOrderByAggregateInput = {
    withdrawalFeePercent?: SortOrder
    withdrawalFeeFixed?: SortOrder
    minWithdrawalAmount?: SortOrder
  }

  export type TenantWithdrawalConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    withdrawalFeePercent?: SortOrder
    withdrawalFeeFixed?: SortOrder
    minWithdrawalAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantWithdrawalConfigMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    withdrawalFeePercent?: SortOrder
    withdrawalFeeFixed?: SortOrder
    minWithdrawalAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantWithdrawalConfigSumOrderByAggregateInput = {
    withdrawalFeePercent?: SortOrder
    withdrawalFeeFixed?: SortOrder
    minWithdrawalAmount?: SortOrder
  }

  export type EnumAdminRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.AdminRole | EnumAdminRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AdminRole[] | ListEnumAdminRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AdminRole[] | ListEnumAdminRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAdminRoleFilter<$PrismaModel> | $Enums.AdminRole
  }

  export type TenantAdminTenantIdEmailCompoundUniqueInput = {
    tenantId: string
    email: string
  }

  export type TenantAdminCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantAdminMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantAdminMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumAdminRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AdminRole | EnumAdminRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AdminRole[] | ListEnumAdminRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AdminRole[] | ListEnumAdminRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAdminRoleWithAggregatesFilter<$PrismaModel> | $Enums.AdminRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAdminRoleFilter<$PrismaModel>
    _max?: NestedEnumAdminRoleFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type SuperAdminCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    permissions?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SuperAdminMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SuperAdminMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type TenantApiKeyCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    keyName?: SortOrder
    apiKey?: SortOrder
    isActive?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type TenantApiKeyMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    keyName?: SortOrder
    apiKey?: SortOrder
    isActive?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type TenantApiKeyMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    keyName?: SortOrder
    apiKey?: SortOrder
    isActive?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type TenantUsageStatsTenantIdDateCompoundUniqueInput = {
    tenantId: string
    date: Date | string
  }

  export type TenantUsageStatsCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    date?: SortOrder
    apiCalls?: SortOrder
    storageUsedMB?: SortOrder
    activeUsers?: SortOrder
    createdAt?: SortOrder
  }

  export type TenantUsageStatsAvgOrderByAggregateInput = {
    apiCalls?: SortOrder
    storageUsedMB?: SortOrder
    activeUsers?: SortOrder
  }

  export type TenantUsageStatsMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    date?: SortOrder
    apiCalls?: SortOrder
    storageUsedMB?: SortOrder
    activeUsers?: SortOrder
    createdAt?: SortOrder
  }

  export type TenantUsageStatsMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    date?: SortOrder
    apiCalls?: SortOrder
    storageUsedMB?: SortOrder
    activeUsers?: SortOrder
    createdAt?: SortOrder
  }

  export type TenantUsageStatsSumOrderByAggregateInput = {
    apiCalls?: SortOrder
    storageUsedMB?: SortOrder
    activeUsers?: SortOrder
  }

  export type TenantBrandingCreateNestedOneWithoutTenantInput = {
    create?: XOR<TenantBrandingCreateWithoutTenantInput, TenantBrandingUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantBrandingCreateOrConnectWithoutTenantInput
    connect?: TenantBrandingWhereUniqueInput
  }

  export type TenantModuleCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput> | TenantModuleCreateWithoutTenantInput[] | TenantModuleUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutTenantInput | TenantModuleCreateOrConnectWithoutTenantInput[]
    createMany?: TenantModuleCreateManyTenantInputEnvelope
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
  }

  export type TenantAdminCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantAdminCreateWithoutTenantInput, TenantAdminUncheckedCreateWithoutTenantInput> | TenantAdminCreateWithoutTenantInput[] | TenantAdminUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantAdminCreateOrConnectWithoutTenantInput | TenantAdminCreateOrConnectWithoutTenantInput[]
    createMany?: TenantAdminCreateManyTenantInputEnvelope
    connect?: TenantAdminWhereUniqueInput | TenantAdminWhereUniqueInput[]
  }

  export type TenantApiKeyCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantApiKeyCreateWithoutTenantInput, TenantApiKeyUncheckedCreateWithoutTenantInput> | TenantApiKeyCreateWithoutTenantInput[] | TenantApiKeyUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantApiKeyCreateOrConnectWithoutTenantInput | TenantApiKeyCreateOrConnectWithoutTenantInput[]
    createMany?: TenantApiKeyCreateManyTenantInputEnvelope
    connect?: TenantApiKeyWhereUniqueInput | TenantApiKeyWhereUniqueInput[]
  }

  export type TenantUsageStatsCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantUsageStatsCreateWithoutTenantInput, TenantUsageStatsUncheckedCreateWithoutTenantInput> | TenantUsageStatsCreateWithoutTenantInput[] | TenantUsageStatsUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantUsageStatsCreateOrConnectWithoutTenantInput | TenantUsageStatsCreateOrConnectWithoutTenantInput[]
    createMany?: TenantUsageStatsCreateManyTenantInputEnvelope
    connect?: TenantUsageStatsWhereUniqueInput | TenantUsageStatsWhereUniqueInput[]
  }

  export type TenantStatsCreateNestedOneWithoutTenantInput = {
    create?: XOR<TenantStatsCreateWithoutTenantInput, TenantStatsUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantStatsCreateOrConnectWithoutTenantInput
    connect?: TenantStatsWhereUniqueInput
  }

  export type TenantCashbackConfigCreateNestedOneWithoutTenantInput = {
    create?: XOR<TenantCashbackConfigCreateWithoutTenantInput, TenantCashbackConfigUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantCashbackConfigCreateOrConnectWithoutTenantInput
    connect?: TenantCashbackConfigWhereUniqueInput
  }

  export type TenantWithdrawalConfigCreateNestedOneWithoutTenantInput = {
    create?: XOR<TenantWithdrawalConfigCreateWithoutTenantInput, TenantWithdrawalConfigUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantWithdrawalConfigCreateOrConnectWithoutTenantInput
    connect?: TenantWithdrawalConfigWhereUniqueInput
  }

  export type TenantBrandingUncheckedCreateNestedOneWithoutTenantInput = {
    create?: XOR<TenantBrandingCreateWithoutTenantInput, TenantBrandingUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantBrandingCreateOrConnectWithoutTenantInput
    connect?: TenantBrandingWhereUniqueInput
  }

  export type TenantModuleUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput> | TenantModuleCreateWithoutTenantInput[] | TenantModuleUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutTenantInput | TenantModuleCreateOrConnectWithoutTenantInput[]
    createMany?: TenantModuleCreateManyTenantInputEnvelope
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
  }

  export type TenantAdminUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantAdminCreateWithoutTenantInput, TenantAdminUncheckedCreateWithoutTenantInput> | TenantAdminCreateWithoutTenantInput[] | TenantAdminUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantAdminCreateOrConnectWithoutTenantInput | TenantAdminCreateOrConnectWithoutTenantInput[]
    createMany?: TenantAdminCreateManyTenantInputEnvelope
    connect?: TenantAdminWhereUniqueInput | TenantAdminWhereUniqueInput[]
  }

  export type TenantApiKeyUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantApiKeyCreateWithoutTenantInput, TenantApiKeyUncheckedCreateWithoutTenantInput> | TenantApiKeyCreateWithoutTenantInput[] | TenantApiKeyUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantApiKeyCreateOrConnectWithoutTenantInput | TenantApiKeyCreateOrConnectWithoutTenantInput[]
    createMany?: TenantApiKeyCreateManyTenantInputEnvelope
    connect?: TenantApiKeyWhereUniqueInput | TenantApiKeyWhereUniqueInput[]
  }

  export type TenantUsageStatsUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantUsageStatsCreateWithoutTenantInput, TenantUsageStatsUncheckedCreateWithoutTenantInput> | TenantUsageStatsCreateWithoutTenantInput[] | TenantUsageStatsUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantUsageStatsCreateOrConnectWithoutTenantInput | TenantUsageStatsCreateOrConnectWithoutTenantInput[]
    createMany?: TenantUsageStatsCreateManyTenantInputEnvelope
    connect?: TenantUsageStatsWhereUniqueInput | TenantUsageStatsWhereUniqueInput[]
  }

  export type TenantStatsUncheckedCreateNestedOneWithoutTenantInput = {
    create?: XOR<TenantStatsCreateWithoutTenantInput, TenantStatsUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantStatsCreateOrConnectWithoutTenantInput
    connect?: TenantStatsWhereUniqueInput
  }

  export type TenantCashbackConfigUncheckedCreateNestedOneWithoutTenantInput = {
    create?: XOR<TenantCashbackConfigCreateWithoutTenantInput, TenantCashbackConfigUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantCashbackConfigCreateOrConnectWithoutTenantInput
    connect?: TenantCashbackConfigWhereUniqueInput
  }

  export type TenantWithdrawalConfigUncheckedCreateNestedOneWithoutTenantInput = {
    create?: XOR<TenantWithdrawalConfigCreateWithoutTenantInput, TenantWithdrawalConfigUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantWithdrawalConfigCreateOrConnectWithoutTenantInput
    connect?: TenantWithdrawalConfigWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumTenantStatusFieldUpdateOperationsInput = {
    set?: $Enums.TenantStatus
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumSubscriptionPlanFieldUpdateOperationsInput = {
    set?: $Enums.SubscriptionPlan
  }

  export type EnumSubscriptionStatusFieldUpdateOperationsInput = {
    set?: $Enums.SubscriptionStatus
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TenantBrandingUpdateOneWithoutTenantNestedInput = {
    create?: XOR<TenantBrandingCreateWithoutTenantInput, TenantBrandingUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantBrandingCreateOrConnectWithoutTenantInput
    upsert?: TenantBrandingUpsertWithoutTenantInput
    disconnect?: TenantBrandingWhereInput | boolean
    delete?: TenantBrandingWhereInput | boolean
    connect?: TenantBrandingWhereUniqueInput
    update?: XOR<XOR<TenantBrandingUpdateToOneWithWhereWithoutTenantInput, TenantBrandingUpdateWithoutTenantInput>, TenantBrandingUncheckedUpdateWithoutTenantInput>
  }

  export type TenantModuleUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput> | TenantModuleCreateWithoutTenantInput[] | TenantModuleUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutTenantInput | TenantModuleCreateOrConnectWithoutTenantInput[]
    upsert?: TenantModuleUpsertWithWhereUniqueWithoutTenantInput | TenantModuleUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantModuleCreateManyTenantInputEnvelope
    set?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    disconnect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    delete?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    update?: TenantModuleUpdateWithWhereUniqueWithoutTenantInput | TenantModuleUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantModuleUpdateManyWithWhereWithoutTenantInput | TenantModuleUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantModuleScalarWhereInput | TenantModuleScalarWhereInput[]
  }

  export type TenantAdminUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantAdminCreateWithoutTenantInput, TenantAdminUncheckedCreateWithoutTenantInput> | TenantAdminCreateWithoutTenantInput[] | TenantAdminUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantAdminCreateOrConnectWithoutTenantInput | TenantAdminCreateOrConnectWithoutTenantInput[]
    upsert?: TenantAdminUpsertWithWhereUniqueWithoutTenantInput | TenantAdminUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantAdminCreateManyTenantInputEnvelope
    set?: TenantAdminWhereUniqueInput | TenantAdminWhereUniqueInput[]
    disconnect?: TenantAdminWhereUniqueInput | TenantAdminWhereUniqueInput[]
    delete?: TenantAdminWhereUniqueInput | TenantAdminWhereUniqueInput[]
    connect?: TenantAdminWhereUniqueInput | TenantAdminWhereUniqueInput[]
    update?: TenantAdminUpdateWithWhereUniqueWithoutTenantInput | TenantAdminUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantAdminUpdateManyWithWhereWithoutTenantInput | TenantAdminUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantAdminScalarWhereInput | TenantAdminScalarWhereInput[]
  }

  export type TenantApiKeyUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantApiKeyCreateWithoutTenantInput, TenantApiKeyUncheckedCreateWithoutTenantInput> | TenantApiKeyCreateWithoutTenantInput[] | TenantApiKeyUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantApiKeyCreateOrConnectWithoutTenantInput | TenantApiKeyCreateOrConnectWithoutTenantInput[]
    upsert?: TenantApiKeyUpsertWithWhereUniqueWithoutTenantInput | TenantApiKeyUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantApiKeyCreateManyTenantInputEnvelope
    set?: TenantApiKeyWhereUniqueInput | TenantApiKeyWhereUniqueInput[]
    disconnect?: TenantApiKeyWhereUniqueInput | TenantApiKeyWhereUniqueInput[]
    delete?: TenantApiKeyWhereUniqueInput | TenantApiKeyWhereUniqueInput[]
    connect?: TenantApiKeyWhereUniqueInput | TenantApiKeyWhereUniqueInput[]
    update?: TenantApiKeyUpdateWithWhereUniqueWithoutTenantInput | TenantApiKeyUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantApiKeyUpdateManyWithWhereWithoutTenantInput | TenantApiKeyUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantApiKeyScalarWhereInput | TenantApiKeyScalarWhereInput[]
  }

  export type TenantUsageStatsUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantUsageStatsCreateWithoutTenantInput, TenantUsageStatsUncheckedCreateWithoutTenantInput> | TenantUsageStatsCreateWithoutTenantInput[] | TenantUsageStatsUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantUsageStatsCreateOrConnectWithoutTenantInput | TenantUsageStatsCreateOrConnectWithoutTenantInput[]
    upsert?: TenantUsageStatsUpsertWithWhereUniqueWithoutTenantInput | TenantUsageStatsUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantUsageStatsCreateManyTenantInputEnvelope
    set?: TenantUsageStatsWhereUniqueInput | TenantUsageStatsWhereUniqueInput[]
    disconnect?: TenantUsageStatsWhereUniqueInput | TenantUsageStatsWhereUniqueInput[]
    delete?: TenantUsageStatsWhereUniqueInput | TenantUsageStatsWhereUniqueInput[]
    connect?: TenantUsageStatsWhereUniqueInput | TenantUsageStatsWhereUniqueInput[]
    update?: TenantUsageStatsUpdateWithWhereUniqueWithoutTenantInput | TenantUsageStatsUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantUsageStatsUpdateManyWithWhereWithoutTenantInput | TenantUsageStatsUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantUsageStatsScalarWhereInput | TenantUsageStatsScalarWhereInput[]
  }

  export type TenantStatsUpdateOneWithoutTenantNestedInput = {
    create?: XOR<TenantStatsCreateWithoutTenantInput, TenantStatsUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantStatsCreateOrConnectWithoutTenantInput
    upsert?: TenantStatsUpsertWithoutTenantInput
    disconnect?: TenantStatsWhereInput | boolean
    delete?: TenantStatsWhereInput | boolean
    connect?: TenantStatsWhereUniqueInput
    update?: XOR<XOR<TenantStatsUpdateToOneWithWhereWithoutTenantInput, TenantStatsUpdateWithoutTenantInput>, TenantStatsUncheckedUpdateWithoutTenantInput>
  }

  export type TenantCashbackConfigUpdateOneWithoutTenantNestedInput = {
    create?: XOR<TenantCashbackConfigCreateWithoutTenantInput, TenantCashbackConfigUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantCashbackConfigCreateOrConnectWithoutTenantInput
    upsert?: TenantCashbackConfigUpsertWithoutTenantInput
    disconnect?: TenantCashbackConfigWhereInput | boolean
    delete?: TenantCashbackConfigWhereInput | boolean
    connect?: TenantCashbackConfigWhereUniqueInput
    update?: XOR<XOR<TenantCashbackConfigUpdateToOneWithWhereWithoutTenantInput, TenantCashbackConfigUpdateWithoutTenantInput>, TenantCashbackConfigUncheckedUpdateWithoutTenantInput>
  }

  export type TenantWithdrawalConfigUpdateOneWithoutTenantNestedInput = {
    create?: XOR<TenantWithdrawalConfigCreateWithoutTenantInput, TenantWithdrawalConfigUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantWithdrawalConfigCreateOrConnectWithoutTenantInput
    upsert?: TenantWithdrawalConfigUpsertWithoutTenantInput
    disconnect?: TenantWithdrawalConfigWhereInput | boolean
    delete?: TenantWithdrawalConfigWhereInput | boolean
    connect?: TenantWithdrawalConfigWhereUniqueInput
    update?: XOR<XOR<TenantWithdrawalConfigUpdateToOneWithWhereWithoutTenantInput, TenantWithdrawalConfigUpdateWithoutTenantInput>, TenantWithdrawalConfigUncheckedUpdateWithoutTenantInput>
  }

  export type TenantBrandingUncheckedUpdateOneWithoutTenantNestedInput = {
    create?: XOR<TenantBrandingCreateWithoutTenantInput, TenantBrandingUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantBrandingCreateOrConnectWithoutTenantInput
    upsert?: TenantBrandingUpsertWithoutTenantInput
    disconnect?: TenantBrandingWhereInput | boolean
    delete?: TenantBrandingWhereInput | boolean
    connect?: TenantBrandingWhereUniqueInput
    update?: XOR<XOR<TenantBrandingUpdateToOneWithWhereWithoutTenantInput, TenantBrandingUpdateWithoutTenantInput>, TenantBrandingUncheckedUpdateWithoutTenantInput>
  }

  export type TenantModuleUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput> | TenantModuleCreateWithoutTenantInput[] | TenantModuleUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutTenantInput | TenantModuleCreateOrConnectWithoutTenantInput[]
    upsert?: TenantModuleUpsertWithWhereUniqueWithoutTenantInput | TenantModuleUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantModuleCreateManyTenantInputEnvelope
    set?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    disconnect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    delete?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    update?: TenantModuleUpdateWithWhereUniqueWithoutTenantInput | TenantModuleUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantModuleUpdateManyWithWhereWithoutTenantInput | TenantModuleUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantModuleScalarWhereInput | TenantModuleScalarWhereInput[]
  }

  export type TenantAdminUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantAdminCreateWithoutTenantInput, TenantAdminUncheckedCreateWithoutTenantInput> | TenantAdminCreateWithoutTenantInput[] | TenantAdminUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantAdminCreateOrConnectWithoutTenantInput | TenantAdminCreateOrConnectWithoutTenantInput[]
    upsert?: TenantAdminUpsertWithWhereUniqueWithoutTenantInput | TenantAdminUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantAdminCreateManyTenantInputEnvelope
    set?: TenantAdminWhereUniqueInput | TenantAdminWhereUniqueInput[]
    disconnect?: TenantAdminWhereUniqueInput | TenantAdminWhereUniqueInput[]
    delete?: TenantAdminWhereUniqueInput | TenantAdminWhereUniqueInput[]
    connect?: TenantAdminWhereUniqueInput | TenantAdminWhereUniqueInput[]
    update?: TenantAdminUpdateWithWhereUniqueWithoutTenantInput | TenantAdminUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantAdminUpdateManyWithWhereWithoutTenantInput | TenantAdminUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantAdminScalarWhereInput | TenantAdminScalarWhereInput[]
  }

  export type TenantApiKeyUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantApiKeyCreateWithoutTenantInput, TenantApiKeyUncheckedCreateWithoutTenantInput> | TenantApiKeyCreateWithoutTenantInput[] | TenantApiKeyUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantApiKeyCreateOrConnectWithoutTenantInput | TenantApiKeyCreateOrConnectWithoutTenantInput[]
    upsert?: TenantApiKeyUpsertWithWhereUniqueWithoutTenantInput | TenantApiKeyUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantApiKeyCreateManyTenantInputEnvelope
    set?: TenantApiKeyWhereUniqueInput | TenantApiKeyWhereUniqueInput[]
    disconnect?: TenantApiKeyWhereUniqueInput | TenantApiKeyWhereUniqueInput[]
    delete?: TenantApiKeyWhereUniqueInput | TenantApiKeyWhereUniqueInput[]
    connect?: TenantApiKeyWhereUniqueInput | TenantApiKeyWhereUniqueInput[]
    update?: TenantApiKeyUpdateWithWhereUniqueWithoutTenantInput | TenantApiKeyUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantApiKeyUpdateManyWithWhereWithoutTenantInput | TenantApiKeyUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantApiKeyScalarWhereInput | TenantApiKeyScalarWhereInput[]
  }

  export type TenantUsageStatsUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantUsageStatsCreateWithoutTenantInput, TenantUsageStatsUncheckedCreateWithoutTenantInput> | TenantUsageStatsCreateWithoutTenantInput[] | TenantUsageStatsUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantUsageStatsCreateOrConnectWithoutTenantInput | TenantUsageStatsCreateOrConnectWithoutTenantInput[]
    upsert?: TenantUsageStatsUpsertWithWhereUniqueWithoutTenantInput | TenantUsageStatsUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantUsageStatsCreateManyTenantInputEnvelope
    set?: TenantUsageStatsWhereUniqueInput | TenantUsageStatsWhereUniqueInput[]
    disconnect?: TenantUsageStatsWhereUniqueInput | TenantUsageStatsWhereUniqueInput[]
    delete?: TenantUsageStatsWhereUniqueInput | TenantUsageStatsWhereUniqueInput[]
    connect?: TenantUsageStatsWhereUniqueInput | TenantUsageStatsWhereUniqueInput[]
    update?: TenantUsageStatsUpdateWithWhereUniqueWithoutTenantInput | TenantUsageStatsUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantUsageStatsUpdateManyWithWhereWithoutTenantInput | TenantUsageStatsUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantUsageStatsScalarWhereInput | TenantUsageStatsScalarWhereInput[]
  }

  export type TenantStatsUncheckedUpdateOneWithoutTenantNestedInput = {
    create?: XOR<TenantStatsCreateWithoutTenantInput, TenantStatsUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantStatsCreateOrConnectWithoutTenantInput
    upsert?: TenantStatsUpsertWithoutTenantInput
    disconnect?: TenantStatsWhereInput | boolean
    delete?: TenantStatsWhereInput | boolean
    connect?: TenantStatsWhereUniqueInput
    update?: XOR<XOR<TenantStatsUpdateToOneWithWhereWithoutTenantInput, TenantStatsUpdateWithoutTenantInput>, TenantStatsUncheckedUpdateWithoutTenantInput>
  }

  export type TenantCashbackConfigUncheckedUpdateOneWithoutTenantNestedInput = {
    create?: XOR<TenantCashbackConfigCreateWithoutTenantInput, TenantCashbackConfigUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantCashbackConfigCreateOrConnectWithoutTenantInput
    upsert?: TenantCashbackConfigUpsertWithoutTenantInput
    disconnect?: TenantCashbackConfigWhereInput | boolean
    delete?: TenantCashbackConfigWhereInput | boolean
    connect?: TenantCashbackConfigWhereUniqueInput
    update?: XOR<XOR<TenantCashbackConfigUpdateToOneWithWhereWithoutTenantInput, TenantCashbackConfigUpdateWithoutTenantInput>, TenantCashbackConfigUncheckedUpdateWithoutTenantInput>
  }

  export type TenantWithdrawalConfigUncheckedUpdateOneWithoutTenantNestedInput = {
    create?: XOR<TenantWithdrawalConfigCreateWithoutTenantInput, TenantWithdrawalConfigUncheckedCreateWithoutTenantInput>
    connectOrCreate?: TenantWithdrawalConfigCreateOrConnectWithoutTenantInput
    upsert?: TenantWithdrawalConfigUpsertWithoutTenantInput
    disconnect?: TenantWithdrawalConfigWhereInput | boolean
    delete?: TenantWithdrawalConfigWhereInput | boolean
    connect?: TenantWithdrawalConfigWhereUniqueInput
    update?: XOR<XOR<TenantWithdrawalConfigUpdateToOneWithWhereWithoutTenantInput, TenantWithdrawalConfigUpdateWithoutTenantInput>, TenantWithdrawalConfigUncheckedUpdateWithoutTenantInput>
  }

  export type TenantCreateNestedOneWithoutBrandingInput = {
    create?: XOR<TenantCreateWithoutBrandingInput, TenantUncheckedCreateWithoutBrandingInput>
    connectOrCreate?: TenantCreateOrConnectWithoutBrandingInput
    connect?: TenantWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutBrandingNestedInput = {
    create?: XOR<TenantCreateWithoutBrandingInput, TenantUncheckedCreateWithoutBrandingInput>
    connectOrCreate?: TenantCreateOrConnectWithoutBrandingInput
    upsert?: TenantUpsertWithoutBrandingInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutBrandingInput, TenantUpdateWithoutBrandingInput>, TenantUncheckedUpdateWithoutBrandingInput>
  }

  export type TenantCreateNestedOneWithoutModulesInput = {
    create?: XOR<TenantCreateWithoutModulesInput, TenantUncheckedCreateWithoutModulesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutModulesInput
    connect?: TenantWhereUniqueInput
  }

  export type EnumModuleKeyFieldUpdateOperationsInput = {
    set?: $Enums.ModuleKey
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type TenantUpdateOneRequiredWithoutModulesNestedInput = {
    create?: XOR<TenantCreateWithoutModulesInput, TenantUncheckedCreateWithoutModulesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutModulesInput
    upsert?: TenantUpsertWithoutModulesInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutModulesInput, TenantUpdateWithoutModulesInput>, TenantUncheckedUpdateWithoutModulesInput>
  }

  export type TenantCreateNestedOneWithoutStatsInput = {
    create?: XOR<TenantCreateWithoutStatsInput, TenantUncheckedCreateWithoutStatsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutStatsInput
    connect?: TenantWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutStatsNestedInput = {
    create?: XOR<TenantCreateWithoutStatsInput, TenantUncheckedCreateWithoutStatsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutStatsInput
    upsert?: TenantUpsertWithoutStatsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutStatsInput, TenantUpdateWithoutStatsInput>, TenantUncheckedUpdateWithoutStatsInput>
  }

  export type TenantCreateNestedOneWithoutCashbackConfigInput = {
    create?: XOR<TenantCreateWithoutCashbackConfigInput, TenantUncheckedCreateWithoutCashbackConfigInput>
    connectOrCreate?: TenantCreateOrConnectWithoutCashbackConfigInput
    connect?: TenantWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutCashbackConfigNestedInput = {
    create?: XOR<TenantCreateWithoutCashbackConfigInput, TenantUncheckedCreateWithoutCashbackConfigInput>
    connectOrCreate?: TenantCreateOrConnectWithoutCashbackConfigInput
    upsert?: TenantUpsertWithoutCashbackConfigInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutCashbackConfigInput, TenantUpdateWithoutCashbackConfigInput>, TenantUncheckedUpdateWithoutCashbackConfigInput>
  }

  export type TenantCreateNestedOneWithoutWithdrawalConfigInput = {
    create?: XOR<TenantCreateWithoutWithdrawalConfigInput, TenantUncheckedCreateWithoutWithdrawalConfigInput>
    connectOrCreate?: TenantCreateOrConnectWithoutWithdrawalConfigInput
    connect?: TenantWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutWithdrawalConfigNestedInput = {
    create?: XOR<TenantCreateWithoutWithdrawalConfigInput, TenantUncheckedCreateWithoutWithdrawalConfigInput>
    connectOrCreate?: TenantCreateOrConnectWithoutWithdrawalConfigInput
    upsert?: TenantUpsertWithoutWithdrawalConfigInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutWithdrawalConfigInput, TenantUpdateWithoutWithdrawalConfigInput>, TenantUncheckedUpdateWithoutWithdrawalConfigInput>
  }

  export type TenantCreateNestedOneWithoutAdminsInput = {
    create?: XOR<TenantCreateWithoutAdminsInput, TenantUncheckedCreateWithoutAdminsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutAdminsInput
    connect?: TenantWhereUniqueInput
  }

  export type EnumAdminRoleFieldUpdateOperationsInput = {
    set?: $Enums.AdminRole
  }

  export type TenantUpdateOneRequiredWithoutAdminsNestedInput = {
    create?: XOR<TenantCreateWithoutAdminsInput, TenantUncheckedCreateWithoutAdminsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutAdminsInput
    upsert?: TenantUpsertWithoutAdminsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutAdminsInput, TenantUpdateWithoutAdminsInput>, TenantUncheckedUpdateWithoutAdminsInput>
  }

  export type TenantCreateNestedOneWithoutApiKeysInput = {
    create?: XOR<TenantCreateWithoutApiKeysInput, TenantUncheckedCreateWithoutApiKeysInput>
    connectOrCreate?: TenantCreateOrConnectWithoutApiKeysInput
    connect?: TenantWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutApiKeysNestedInput = {
    create?: XOR<TenantCreateWithoutApiKeysInput, TenantUncheckedCreateWithoutApiKeysInput>
    connectOrCreate?: TenantCreateOrConnectWithoutApiKeysInput
    upsert?: TenantUpsertWithoutApiKeysInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutApiKeysInput, TenantUpdateWithoutApiKeysInput>, TenantUncheckedUpdateWithoutApiKeysInput>
  }

  export type TenantCreateNestedOneWithoutUsageStatsInput = {
    create?: XOR<TenantCreateWithoutUsageStatsInput, TenantUncheckedCreateWithoutUsageStatsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsageStatsInput
    connect?: TenantWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutUsageStatsNestedInput = {
    create?: XOR<TenantCreateWithoutUsageStatsInput, TenantUncheckedCreateWithoutUsageStatsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsageStatsInput
    upsert?: TenantUpsertWithoutUsageStatsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutUsageStatsInput, TenantUpdateWithoutUsageStatsInput>, TenantUncheckedUpdateWithoutUsageStatsInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumTenantStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusFilter<$PrismaModel> | $Enums.TenantStatus
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumSubscriptionPlanFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionPlan | EnumSubscriptionPlanFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionPlanFilter<$PrismaModel> | $Enums.SubscriptionPlan
  }

  export type NestedEnumSubscriptionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionStatus | EnumSubscriptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionStatusFilter<$PrismaModel> | $Enums.SubscriptionStatus
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel> | $Enums.TenantStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTenantStatusFilter<$PrismaModel>
    _max?: NestedEnumTenantStatusFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumSubscriptionPlanWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionPlan | EnumSubscriptionPlanFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionPlanWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionPlan
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSubscriptionPlanFilter<$PrismaModel>
    _max?: NestedEnumSubscriptionPlanFilter<$PrismaModel>
  }

  export type NestedEnumSubscriptionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionStatus | EnumSubscriptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionStatusWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSubscriptionStatusFilter<$PrismaModel>
    _max?: NestedEnumSubscriptionStatusFilter<$PrismaModel>
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumModuleKeyFilter<$PrismaModel = never> = {
    equals?: $Enums.ModuleKey | EnumModuleKeyFieldRefInput<$PrismaModel>
    in?: $Enums.ModuleKey[] | ListEnumModuleKeyFieldRefInput<$PrismaModel>
    notIn?: $Enums.ModuleKey[] | ListEnumModuleKeyFieldRefInput<$PrismaModel>
    not?: NestedEnumModuleKeyFilter<$PrismaModel> | $Enums.ModuleKey
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumModuleKeyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ModuleKey | EnumModuleKeyFieldRefInput<$PrismaModel>
    in?: $Enums.ModuleKey[] | ListEnumModuleKeyFieldRefInput<$PrismaModel>
    notIn?: $Enums.ModuleKey[] | ListEnumModuleKeyFieldRefInput<$PrismaModel>
    not?: NestedEnumModuleKeyWithAggregatesFilter<$PrismaModel> | $Enums.ModuleKey
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumModuleKeyFilter<$PrismaModel>
    _max?: NestedEnumModuleKeyFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumAdminRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.AdminRole | EnumAdminRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AdminRole[] | ListEnumAdminRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AdminRole[] | ListEnumAdminRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAdminRoleFilter<$PrismaModel> | $Enums.AdminRole
  }

  export type NestedEnumAdminRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AdminRole | EnumAdminRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AdminRole[] | ListEnumAdminRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AdminRole[] | ListEnumAdminRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAdminRoleWithAggregatesFilter<$PrismaModel> | $Enums.AdminRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAdminRoleFilter<$PrismaModel>
    _max?: NestedEnumAdminRoleFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type TenantBrandingCreateWithoutTenantInput = {
    id?: string
    logoUrl?: string | null
    logoIconUrl?: string | null
    faviconUrl?: string | null
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    backgroundColor?: string
    textColor?: string
    appName: string
    appDescription?: string | null
    appStoreUrl?: string | null
    playStoreUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantBrandingUncheckedCreateWithoutTenantInput = {
    id?: string
    logoUrl?: string | null
    logoIconUrl?: string | null
    faviconUrl?: string | null
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    backgroundColor?: string
    textColor?: string
    appName: string
    appDescription?: string | null
    appStoreUrl?: string | null
    playStoreUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantBrandingCreateOrConnectWithoutTenantInput = {
    where: TenantBrandingWhereUniqueInput
    create: XOR<TenantBrandingCreateWithoutTenantInput, TenantBrandingUncheckedCreateWithoutTenantInput>
  }

  export type TenantModuleCreateWithoutTenantInput = {
    id?: string
    moduleKey: $Enums.ModuleKey
    isEnabled?: boolean
    isEnabledByDefault?: boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName: string
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleUncheckedCreateWithoutTenantInput = {
    id?: string
    moduleKey: $Enums.ModuleKey
    isEnabled?: boolean
    isEnabledByDefault?: boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName: string
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleCreateOrConnectWithoutTenantInput = {
    where: TenantModuleWhereUniqueInput
    create: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput>
  }

  export type TenantModuleCreateManyTenantInputEnvelope = {
    data: TenantModuleCreateManyTenantInput | TenantModuleCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type TenantAdminCreateWithoutTenantInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.AdminRole
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantAdminUncheckedCreateWithoutTenantInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.AdminRole
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantAdminCreateOrConnectWithoutTenantInput = {
    where: TenantAdminWhereUniqueInput
    create: XOR<TenantAdminCreateWithoutTenantInput, TenantAdminUncheckedCreateWithoutTenantInput>
  }

  export type TenantAdminCreateManyTenantInputEnvelope = {
    data: TenantAdminCreateManyTenantInput | TenantAdminCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type TenantApiKeyCreateWithoutTenantInput = {
    id?: string
    keyName: string
    apiKey: string
    isActive?: boolean
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    expiresAt?: Date | string | null
  }

  export type TenantApiKeyUncheckedCreateWithoutTenantInput = {
    id?: string
    keyName: string
    apiKey: string
    isActive?: boolean
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    expiresAt?: Date | string | null
  }

  export type TenantApiKeyCreateOrConnectWithoutTenantInput = {
    where: TenantApiKeyWhereUniqueInput
    create: XOR<TenantApiKeyCreateWithoutTenantInput, TenantApiKeyUncheckedCreateWithoutTenantInput>
  }

  export type TenantApiKeyCreateManyTenantInputEnvelope = {
    data: TenantApiKeyCreateManyTenantInput | TenantApiKeyCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type TenantUsageStatsCreateWithoutTenantInput = {
    id?: string
    date: Date | string
    apiCalls?: number
    storageUsedMB?: number
    activeUsers?: number
    createdAt?: Date | string
  }

  export type TenantUsageStatsUncheckedCreateWithoutTenantInput = {
    id?: string
    date: Date | string
    apiCalls?: number
    storageUsedMB?: number
    activeUsers?: number
    createdAt?: Date | string
  }

  export type TenantUsageStatsCreateOrConnectWithoutTenantInput = {
    where: TenantUsageStatsWhereUniqueInput
    create: XOR<TenantUsageStatsCreateWithoutTenantInput, TenantUsageStatsUncheckedCreateWithoutTenantInput>
  }

  export type TenantUsageStatsCreateManyTenantInputEnvelope = {
    data: TenantUsageStatsCreateManyTenantInput | TenantUsageStatsCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type TenantStatsCreateWithoutTenantInput = {
    id?: string
    totalUsers?: number
    totalConsumers?: number
    totalMerchants?: number
    activeUsers30d?: number
    totalPurchases?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: Decimal | DecimalJsLike | number | string
    totalPlatformFees?: Decimal | DecimalJsLike | number | string
    totalProducts?: number
    revenue30d?: Decimal | DecimalJsLike | number | string
    purchases30d?: number
    cashback30d?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantStatsUncheckedCreateWithoutTenantInput = {
    id?: string
    totalUsers?: number
    totalConsumers?: number
    totalMerchants?: number
    activeUsers30d?: number
    totalPurchases?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: Decimal | DecimalJsLike | number | string
    totalPlatformFees?: Decimal | DecimalJsLike | number | string
    totalProducts?: number
    revenue30d?: Decimal | DecimalJsLike | number | string
    purchases30d?: number
    cashback30d?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantStatsCreateOrConnectWithoutTenantInput = {
    where: TenantStatsWhereUniqueInput
    create: XOR<TenantStatsCreateWithoutTenantInput, TenantStatsUncheckedCreateWithoutTenantInput>
  }

  export type TenantCashbackConfigCreateWithoutTenantInput = {
    id?: string
    consumerPercent?: Decimal | DecimalJsLike | number | string
    clubPercent?: Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantCashbackConfigUncheckedCreateWithoutTenantInput = {
    id?: string
    consumerPercent?: Decimal | DecimalJsLike | number | string
    clubPercent?: Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantCashbackConfigCreateOrConnectWithoutTenantInput = {
    where: TenantCashbackConfigWhereUniqueInput
    create: XOR<TenantCashbackConfigCreateWithoutTenantInput, TenantCashbackConfigUncheckedCreateWithoutTenantInput>
  }

  export type TenantWithdrawalConfigCreateWithoutTenantInput = {
    id?: string
    withdrawalFeePercent?: Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantWithdrawalConfigUncheckedCreateWithoutTenantInput = {
    id?: string
    withdrawalFeePercent?: Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantWithdrawalConfigCreateOrConnectWithoutTenantInput = {
    where: TenantWithdrawalConfigWhereUniqueInput
    create: XOR<TenantWithdrawalConfigCreateWithoutTenantInput, TenantWithdrawalConfigUncheckedCreateWithoutTenantInput>
  }

  export type TenantBrandingUpsertWithoutTenantInput = {
    update: XOR<TenantBrandingUpdateWithoutTenantInput, TenantBrandingUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantBrandingCreateWithoutTenantInput, TenantBrandingUncheckedCreateWithoutTenantInput>
    where?: TenantBrandingWhereInput
  }

  export type TenantBrandingUpdateToOneWithWhereWithoutTenantInput = {
    where?: TenantBrandingWhereInput
    data: XOR<TenantBrandingUpdateWithoutTenantInput, TenantBrandingUncheckedUpdateWithoutTenantInput>
  }

  export type TenantBrandingUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logoIconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    faviconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: StringFieldUpdateOperationsInput | string
    secondaryColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    backgroundColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    appName?: StringFieldUpdateOperationsInput | string
    appDescription?: NullableStringFieldUpdateOperationsInput | string | null
    appStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    playStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantBrandingUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    logoIconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    faviconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: StringFieldUpdateOperationsInput | string
    secondaryColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    backgroundColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    appName?: StringFieldUpdateOperationsInput | string
    appDescription?: NullableStringFieldUpdateOperationsInput | string | null
    appStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    playStoreUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleUpsertWithWhereUniqueWithoutTenantInput = {
    where: TenantModuleWhereUniqueInput
    update: XOR<TenantModuleUpdateWithoutTenantInput, TenantModuleUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput>
  }

  export type TenantModuleUpdateWithWhereUniqueWithoutTenantInput = {
    where: TenantModuleWhereUniqueInput
    data: XOR<TenantModuleUpdateWithoutTenantInput, TenantModuleUncheckedUpdateWithoutTenantInput>
  }

  export type TenantModuleUpdateManyWithWhereWithoutTenantInput = {
    where: TenantModuleScalarWhereInput
    data: XOR<TenantModuleUpdateManyMutationInput, TenantModuleUncheckedUpdateManyWithoutTenantInput>
  }

  export type TenantModuleScalarWhereInput = {
    AND?: TenantModuleScalarWhereInput | TenantModuleScalarWhereInput[]
    OR?: TenantModuleScalarWhereInput[]
    NOT?: TenantModuleScalarWhereInput | TenantModuleScalarWhereInput[]
    id?: UuidFilter<"TenantModule"> | string
    tenantId?: UuidFilter<"TenantModule"> | string
    moduleKey?: EnumModuleKeyFilter<"TenantModule"> | $Enums.ModuleKey
    isEnabled?: BoolFilter<"TenantModule"> | boolean
    isEnabledByDefault?: BoolFilter<"TenantModule"> | boolean
    config?: JsonNullableFilter<"TenantModule">
    displayName?: StringFilter<"TenantModule"> | string
    description?: StringNullableFilter<"TenantModule"> | string | null
    sortOrder?: IntFilter<"TenantModule"> | number
    createdAt?: DateTimeFilter<"TenantModule"> | Date | string
    updatedAt?: DateTimeFilter<"TenantModule"> | Date | string
  }

  export type TenantAdminUpsertWithWhereUniqueWithoutTenantInput = {
    where: TenantAdminWhereUniqueInput
    update: XOR<TenantAdminUpdateWithoutTenantInput, TenantAdminUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantAdminCreateWithoutTenantInput, TenantAdminUncheckedCreateWithoutTenantInput>
  }

  export type TenantAdminUpdateWithWhereUniqueWithoutTenantInput = {
    where: TenantAdminWhereUniqueInput
    data: XOR<TenantAdminUpdateWithoutTenantInput, TenantAdminUncheckedUpdateWithoutTenantInput>
  }

  export type TenantAdminUpdateManyWithWhereWithoutTenantInput = {
    where: TenantAdminScalarWhereInput
    data: XOR<TenantAdminUpdateManyMutationInput, TenantAdminUncheckedUpdateManyWithoutTenantInput>
  }

  export type TenantAdminScalarWhereInput = {
    AND?: TenantAdminScalarWhereInput | TenantAdminScalarWhereInput[]
    OR?: TenantAdminScalarWhereInput[]
    NOT?: TenantAdminScalarWhereInput | TenantAdminScalarWhereInput[]
    id?: UuidFilter<"TenantAdmin"> | string
    tenantId?: UuidFilter<"TenantAdmin"> | string
    name?: StringFilter<"TenantAdmin"> | string
    email?: StringFilter<"TenantAdmin"> | string
    password?: StringFilter<"TenantAdmin"> | string
    role?: EnumAdminRoleFilter<"TenantAdmin"> | $Enums.AdminRole
    isActive?: BoolFilter<"TenantAdmin"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"TenantAdmin"> | Date | string | null
    createdAt?: DateTimeFilter<"TenantAdmin"> | Date | string
    updatedAt?: DateTimeFilter<"TenantAdmin"> | Date | string
  }

  export type TenantApiKeyUpsertWithWhereUniqueWithoutTenantInput = {
    where: TenantApiKeyWhereUniqueInput
    update: XOR<TenantApiKeyUpdateWithoutTenantInput, TenantApiKeyUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantApiKeyCreateWithoutTenantInput, TenantApiKeyUncheckedCreateWithoutTenantInput>
  }

  export type TenantApiKeyUpdateWithWhereUniqueWithoutTenantInput = {
    where: TenantApiKeyWhereUniqueInput
    data: XOR<TenantApiKeyUpdateWithoutTenantInput, TenantApiKeyUncheckedUpdateWithoutTenantInput>
  }

  export type TenantApiKeyUpdateManyWithWhereWithoutTenantInput = {
    where: TenantApiKeyScalarWhereInput
    data: XOR<TenantApiKeyUpdateManyMutationInput, TenantApiKeyUncheckedUpdateManyWithoutTenantInput>
  }

  export type TenantApiKeyScalarWhereInput = {
    AND?: TenantApiKeyScalarWhereInput | TenantApiKeyScalarWhereInput[]
    OR?: TenantApiKeyScalarWhereInput[]
    NOT?: TenantApiKeyScalarWhereInput | TenantApiKeyScalarWhereInput[]
    id?: UuidFilter<"TenantApiKey"> | string
    tenantId?: UuidFilter<"TenantApiKey"> | string
    keyName?: StringFilter<"TenantApiKey"> | string
    apiKey?: StringFilter<"TenantApiKey"> | string
    isActive?: BoolFilter<"TenantApiKey"> | boolean
    lastUsedAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
    createdAt?: DateTimeFilter<"TenantApiKey"> | Date | string
    expiresAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
  }

  export type TenantUsageStatsUpsertWithWhereUniqueWithoutTenantInput = {
    where: TenantUsageStatsWhereUniqueInput
    update: XOR<TenantUsageStatsUpdateWithoutTenantInput, TenantUsageStatsUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantUsageStatsCreateWithoutTenantInput, TenantUsageStatsUncheckedCreateWithoutTenantInput>
  }

  export type TenantUsageStatsUpdateWithWhereUniqueWithoutTenantInput = {
    where: TenantUsageStatsWhereUniqueInput
    data: XOR<TenantUsageStatsUpdateWithoutTenantInput, TenantUsageStatsUncheckedUpdateWithoutTenantInput>
  }

  export type TenantUsageStatsUpdateManyWithWhereWithoutTenantInput = {
    where: TenantUsageStatsScalarWhereInput
    data: XOR<TenantUsageStatsUpdateManyMutationInput, TenantUsageStatsUncheckedUpdateManyWithoutTenantInput>
  }

  export type TenantUsageStatsScalarWhereInput = {
    AND?: TenantUsageStatsScalarWhereInput | TenantUsageStatsScalarWhereInput[]
    OR?: TenantUsageStatsScalarWhereInput[]
    NOT?: TenantUsageStatsScalarWhereInput | TenantUsageStatsScalarWhereInput[]
    id?: UuidFilter<"TenantUsageStats"> | string
    tenantId?: UuidFilter<"TenantUsageStats"> | string
    date?: DateTimeFilter<"TenantUsageStats"> | Date | string
    apiCalls?: IntFilter<"TenantUsageStats"> | number
    storageUsedMB?: IntFilter<"TenantUsageStats"> | number
    activeUsers?: IntFilter<"TenantUsageStats"> | number
    createdAt?: DateTimeFilter<"TenantUsageStats"> | Date | string
  }

  export type TenantStatsUpsertWithoutTenantInput = {
    update: XOR<TenantStatsUpdateWithoutTenantInput, TenantStatsUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantStatsCreateWithoutTenantInput, TenantStatsUncheckedCreateWithoutTenantInput>
    where?: TenantStatsWhereInput
  }

  export type TenantStatsUpdateToOneWithWhereWithoutTenantInput = {
    where?: TenantStatsWhereInput
    data: XOR<TenantStatsUpdateWithoutTenantInput, TenantStatsUncheckedUpdateWithoutTenantInput>
  }

  export type TenantStatsUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalUsers?: IntFieldUpdateOperationsInput | number
    totalConsumers?: IntFieldUpdateOperationsInput | number
    totalMerchants?: IntFieldUpdateOperationsInput | number
    activeUsers30d?: IntFieldUpdateOperationsInput | number
    totalPurchases?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    revenue30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFieldUpdateOperationsInput | number
    cashback30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantStatsUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalUsers?: IntFieldUpdateOperationsInput | number
    totalConsumers?: IntFieldUpdateOperationsInput | number
    totalMerchants?: IntFieldUpdateOperationsInput | number
    activeUsers30d?: IntFieldUpdateOperationsInput | number
    totalPurchases?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalCashbackPaid?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPlatformFees?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    revenue30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    purchases30d?: IntFieldUpdateOperationsInput | number
    cashback30d?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCashbackConfigUpsertWithoutTenantInput = {
    update: XOR<TenantCashbackConfigUpdateWithoutTenantInput, TenantCashbackConfigUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantCashbackConfigCreateWithoutTenantInput, TenantCashbackConfigUncheckedCreateWithoutTenantInput>
    where?: TenantCashbackConfigWhereInput
  }

  export type TenantCashbackConfigUpdateToOneWithWhereWithoutTenantInput = {
    where?: TenantCashbackConfigWhereInput
    data: XOR<TenantCashbackConfigUpdateWithoutTenantInput, TenantCashbackConfigUncheckedUpdateWithoutTenantInput>
  }

  export type TenantCashbackConfigUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCashbackConfigUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantWithdrawalConfigUpsertWithoutTenantInput = {
    update: XOR<TenantWithdrawalConfigUpdateWithoutTenantInput, TenantWithdrawalConfigUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantWithdrawalConfigCreateWithoutTenantInput, TenantWithdrawalConfigUncheckedCreateWithoutTenantInput>
    where?: TenantWithdrawalConfigWhereInput
  }

  export type TenantWithdrawalConfigUpdateToOneWithWhereWithoutTenantInput = {
    where?: TenantWithdrawalConfigWhereInput
    data: XOR<TenantWithdrawalConfigUpdateWithoutTenantInput, TenantWithdrawalConfigUncheckedUpdateWithoutTenantInput>
  }

  export type TenantWithdrawalConfigUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    withdrawalFeePercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantWithdrawalConfigUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    withdrawalFeePercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    withdrawalFeeFixed?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    minWithdrawalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateWithoutBrandingInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    modules?: TenantModuleCreateNestedManyWithoutTenantInput
    admins?: TenantAdminCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsCreateNestedManyWithoutTenantInput
    stats?: TenantStatsCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigCreateNestedOneWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutBrandingInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    modules?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    admins?: TenantAdminUncheckedCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyUncheckedCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsUncheckedCreateNestedManyWithoutTenantInput
    stats?: TenantStatsUncheckedCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigUncheckedCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedCreateNestedOneWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutBrandingInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutBrandingInput, TenantUncheckedCreateWithoutBrandingInput>
  }

  export type TenantUpsertWithoutBrandingInput = {
    update: XOR<TenantUpdateWithoutBrandingInput, TenantUncheckedUpdateWithoutBrandingInput>
    create: XOR<TenantCreateWithoutBrandingInput, TenantUncheckedCreateWithoutBrandingInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutBrandingInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutBrandingInput, TenantUncheckedUpdateWithoutBrandingInput>
  }

  export type TenantUpdateWithoutBrandingInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modules?: TenantModuleUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUpdateOneWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutBrandingInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modules?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUncheckedUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUncheckedUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUncheckedUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUncheckedUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUncheckedUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedUpdateOneWithoutTenantNestedInput
  }

  export type TenantCreateWithoutModulesInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingCreateNestedOneWithoutTenantInput
    admins?: TenantAdminCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsCreateNestedManyWithoutTenantInput
    stats?: TenantStatsCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigCreateNestedOneWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutModulesInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingUncheckedCreateNestedOneWithoutTenantInput
    admins?: TenantAdminUncheckedCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyUncheckedCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsUncheckedCreateNestedManyWithoutTenantInput
    stats?: TenantStatsUncheckedCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigUncheckedCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedCreateNestedOneWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutModulesInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutModulesInput, TenantUncheckedCreateWithoutModulesInput>
  }

  export type TenantUpsertWithoutModulesInput = {
    update: XOR<TenantUpdateWithoutModulesInput, TenantUncheckedUpdateWithoutModulesInput>
    create: XOR<TenantCreateWithoutModulesInput, TenantUncheckedCreateWithoutModulesInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutModulesInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutModulesInput, TenantUncheckedUpdateWithoutModulesInput>
  }

  export type TenantUpdateWithoutModulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUpdateOneWithoutTenantNestedInput
    admins?: TenantAdminUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUpdateOneWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutModulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUncheckedUpdateOneWithoutTenantNestedInput
    admins?: TenantAdminUncheckedUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUncheckedUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUncheckedUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUncheckedUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUncheckedUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedUpdateOneWithoutTenantNestedInput
  }

  export type TenantCreateWithoutStatsInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingCreateNestedOneWithoutTenantInput
    modules?: TenantModuleCreateNestedManyWithoutTenantInput
    admins?: TenantAdminCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsCreateNestedManyWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigCreateNestedOneWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutStatsInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingUncheckedCreateNestedOneWithoutTenantInput
    modules?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    admins?: TenantAdminUncheckedCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyUncheckedCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsUncheckedCreateNestedManyWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigUncheckedCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedCreateNestedOneWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutStatsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutStatsInput, TenantUncheckedCreateWithoutStatsInput>
  }

  export type TenantUpsertWithoutStatsInput = {
    update: XOR<TenantUpdateWithoutStatsInput, TenantUncheckedUpdateWithoutStatsInput>
    create: XOR<TenantCreateWithoutStatsInput, TenantUncheckedCreateWithoutStatsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutStatsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutStatsInput, TenantUncheckedUpdateWithoutStatsInput>
  }

  export type TenantUpdateWithoutStatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUpdateManyWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUpdateOneWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutStatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUncheckedUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUncheckedUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUncheckedUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUncheckedUpdateManyWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUncheckedUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedUpdateOneWithoutTenantNestedInput
  }

  export type TenantCreateWithoutCashbackConfigInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingCreateNestedOneWithoutTenantInput
    modules?: TenantModuleCreateNestedManyWithoutTenantInput
    admins?: TenantAdminCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsCreateNestedManyWithoutTenantInput
    stats?: TenantStatsCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigCreateNestedOneWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutCashbackConfigInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingUncheckedCreateNestedOneWithoutTenantInput
    modules?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    admins?: TenantAdminUncheckedCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyUncheckedCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsUncheckedCreateNestedManyWithoutTenantInput
    stats?: TenantStatsUncheckedCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedCreateNestedOneWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutCashbackConfigInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutCashbackConfigInput, TenantUncheckedCreateWithoutCashbackConfigInput>
  }

  export type TenantUpsertWithoutCashbackConfigInput = {
    update: XOR<TenantUpdateWithoutCashbackConfigInput, TenantUncheckedUpdateWithoutCashbackConfigInput>
    create: XOR<TenantCreateWithoutCashbackConfigInput, TenantUncheckedCreateWithoutCashbackConfigInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutCashbackConfigInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutCashbackConfigInput, TenantUncheckedUpdateWithoutCashbackConfigInput>
  }

  export type TenantUpdateWithoutCashbackConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUpdateOneWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutCashbackConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUncheckedUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUncheckedUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUncheckedUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUncheckedUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUncheckedUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedUpdateOneWithoutTenantNestedInput
  }

  export type TenantCreateWithoutWithdrawalConfigInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingCreateNestedOneWithoutTenantInput
    modules?: TenantModuleCreateNestedManyWithoutTenantInput
    admins?: TenantAdminCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsCreateNestedManyWithoutTenantInput
    stats?: TenantStatsCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigCreateNestedOneWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutWithdrawalConfigInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingUncheckedCreateNestedOneWithoutTenantInput
    modules?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    admins?: TenantAdminUncheckedCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyUncheckedCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsUncheckedCreateNestedManyWithoutTenantInput
    stats?: TenantStatsUncheckedCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigUncheckedCreateNestedOneWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutWithdrawalConfigInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutWithdrawalConfigInput, TenantUncheckedCreateWithoutWithdrawalConfigInput>
  }

  export type TenantUpsertWithoutWithdrawalConfigInput = {
    update: XOR<TenantUpdateWithoutWithdrawalConfigInput, TenantUncheckedUpdateWithoutWithdrawalConfigInput>
    create: XOR<TenantCreateWithoutWithdrawalConfigInput, TenantUncheckedCreateWithoutWithdrawalConfigInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutWithdrawalConfigInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutWithdrawalConfigInput, TenantUncheckedUpdateWithoutWithdrawalConfigInput>
  }

  export type TenantUpdateWithoutWithdrawalConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUpdateOneWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutWithdrawalConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUncheckedUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUncheckedUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUncheckedUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUncheckedUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUncheckedUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUncheckedUpdateOneWithoutTenantNestedInput
  }

  export type TenantCreateWithoutAdminsInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingCreateNestedOneWithoutTenantInput
    modules?: TenantModuleCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsCreateNestedManyWithoutTenantInput
    stats?: TenantStatsCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigCreateNestedOneWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutAdminsInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingUncheckedCreateNestedOneWithoutTenantInput
    modules?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyUncheckedCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsUncheckedCreateNestedManyWithoutTenantInput
    stats?: TenantStatsUncheckedCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigUncheckedCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedCreateNestedOneWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutAdminsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutAdminsInput, TenantUncheckedCreateWithoutAdminsInput>
  }

  export type TenantUpsertWithoutAdminsInput = {
    update: XOR<TenantUpdateWithoutAdminsInput, TenantUncheckedUpdateWithoutAdminsInput>
    create: XOR<TenantCreateWithoutAdminsInput, TenantUncheckedCreateWithoutAdminsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutAdminsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutAdminsInput, TenantUncheckedUpdateWithoutAdminsInput>
  }

  export type TenantUpdateWithoutAdminsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUpdateOneWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutAdminsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUncheckedUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUncheckedUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUncheckedUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUncheckedUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUncheckedUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedUpdateOneWithoutTenantNestedInput
  }

  export type TenantCreateWithoutApiKeysInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingCreateNestedOneWithoutTenantInput
    modules?: TenantModuleCreateNestedManyWithoutTenantInput
    admins?: TenantAdminCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsCreateNestedManyWithoutTenantInput
    stats?: TenantStatsCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigCreateNestedOneWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutApiKeysInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingUncheckedCreateNestedOneWithoutTenantInput
    modules?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    admins?: TenantAdminUncheckedCreateNestedManyWithoutTenantInput
    usageStats?: TenantUsageStatsUncheckedCreateNestedManyWithoutTenantInput
    stats?: TenantStatsUncheckedCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigUncheckedCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedCreateNestedOneWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutApiKeysInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutApiKeysInput, TenantUncheckedCreateWithoutApiKeysInput>
  }

  export type TenantUpsertWithoutApiKeysInput = {
    update: XOR<TenantUpdateWithoutApiKeysInput, TenantUncheckedUpdateWithoutApiKeysInput>
    create: XOR<TenantCreateWithoutApiKeysInput, TenantUncheckedCreateWithoutApiKeysInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutApiKeysInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutApiKeysInput, TenantUncheckedUpdateWithoutApiKeysInput>
  }

  export type TenantUpdateWithoutApiKeysInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUpdateOneWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutApiKeysInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUncheckedUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUncheckedUpdateManyWithoutTenantNestedInput
    usageStats?: TenantUsageStatsUncheckedUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUncheckedUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUncheckedUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedUpdateOneWithoutTenantNestedInput
  }

  export type TenantCreateWithoutUsageStatsInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingCreateNestedOneWithoutTenantInput
    modules?: TenantModuleCreateNestedManyWithoutTenantInput
    admins?: TenantAdminCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyCreateNestedManyWithoutTenantInput
    stats?: TenantStatsCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigCreateNestedOneWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutUsageStatsInput = {
    id?: string
    slug: string
    companyName: string
    companyDocument: string
    status?: $Enums.TenantStatus
    databaseHost: string
    databasePort?: number
    databaseName: string
    databaseUser: string
    databasePassword: string
    subdomain?: string | null
    customDomain?: string | null
    adminSubdomain?: string | null
    maxUsers?: number
    maxAdmins?: number
    maxStorageGB?: number
    subscriptionPlan?: $Enums.SubscriptionPlan
    subscriptionStatus?: $Enums.SubscriptionStatus
    monthlyFee?: Decimal | DecimalJsLike | number | string
    trialEndsAt?: Date | string | null
    nextBillingDate?: Date | string | null
    lastBillingDate?: Date | string | null
    totalBilled?: Decimal | DecimalJsLike | number | string
    outstandingBalance?: Decimal | DecimalJsLike | number | string
    contactName: string
    contactEmail: string
    contactPhone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    branding?: TenantBrandingUncheckedCreateNestedOneWithoutTenantInput
    modules?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    admins?: TenantAdminUncheckedCreateNestedManyWithoutTenantInput
    apiKeys?: TenantApiKeyUncheckedCreateNestedManyWithoutTenantInput
    stats?: TenantStatsUncheckedCreateNestedOneWithoutTenantInput
    cashbackConfig?: TenantCashbackConfigUncheckedCreateNestedOneWithoutTenantInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedCreateNestedOneWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutUsageStatsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutUsageStatsInput, TenantUncheckedCreateWithoutUsageStatsInput>
  }

  export type TenantUpsertWithoutUsageStatsInput = {
    update: XOR<TenantUpdateWithoutUsageStatsInput, TenantUncheckedUpdateWithoutUsageStatsInput>
    create: XOR<TenantCreateWithoutUsageStatsInput, TenantUncheckedCreateWithoutUsageStatsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutUsageStatsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutUsageStatsInput, TenantUncheckedUpdateWithoutUsageStatsInput>
  }

  export type TenantUpdateWithoutUsageStatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUpdateOneWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutUsageStatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    companyDocument?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    databaseHost?: StringFieldUpdateOperationsInput | string
    databasePort?: IntFieldUpdateOperationsInput | number
    databaseName?: StringFieldUpdateOperationsInput | string
    databaseUser?: StringFieldUpdateOperationsInput | string
    databasePassword?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    adminSubdomain?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxAdmins?: IntFieldUpdateOperationsInput | number
    maxStorageGB?: IntFieldUpdateOperationsInput | number
    subscriptionPlan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    subscriptionStatus?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    monthlyFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastBillingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalBilled?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    outstandingBalance?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    contactName?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    branding?: TenantBrandingUncheckedUpdateOneWithoutTenantNestedInput
    modules?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    admins?: TenantAdminUncheckedUpdateManyWithoutTenantNestedInput
    apiKeys?: TenantApiKeyUncheckedUpdateManyWithoutTenantNestedInput
    stats?: TenantStatsUncheckedUpdateOneWithoutTenantNestedInput
    cashbackConfig?: TenantCashbackConfigUncheckedUpdateOneWithoutTenantNestedInput
    withdrawalConfig?: TenantWithdrawalConfigUncheckedUpdateOneWithoutTenantNestedInput
  }

  export type TenantModuleCreateManyTenantInput = {
    id?: string
    moduleKey: $Enums.ModuleKey
    isEnabled?: boolean
    isEnabledByDefault?: boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName: string
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantAdminCreateManyTenantInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.AdminRole
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantApiKeyCreateManyTenantInput = {
    id?: string
    keyName: string
    apiKey: string
    isActive?: boolean
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    expiresAt?: Date | string | null
  }

  export type TenantUsageStatsCreateManyTenantInput = {
    id?: string
    date: Date | string
    apiCalls?: number
    storageUsedMB?: number
    activeUsers?: number
    createdAt?: Date | string
  }

  export type TenantModuleUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleKey?: EnumModuleKeyFieldUpdateOperationsInput | $Enums.ModuleKey
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    isEnabledByDefault?: BoolFieldUpdateOperationsInput | boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleKey?: EnumModuleKeyFieldUpdateOperationsInput | $Enums.ModuleKey
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    isEnabledByDefault?: BoolFieldUpdateOperationsInput | boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleKey?: EnumModuleKeyFieldUpdateOperationsInput | $Enums.ModuleKey
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    isEnabledByDefault?: BoolFieldUpdateOperationsInput | boolean
    config?: NullableJsonNullValueInput | InputJsonValue
    displayName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAdminUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAdminRoleFieldUpdateOperationsInput | $Enums.AdminRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAdminUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAdminRoleFieldUpdateOperationsInput | $Enums.AdminRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantAdminUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAdminRoleFieldUpdateOperationsInput | $Enums.AdminRole
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantApiKeyUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyName?: StringFieldUpdateOperationsInput | string
    apiKey?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantApiKeyUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyName?: StringFieldUpdateOperationsInput | string
    apiKey?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantApiKeyUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    keyName?: StringFieldUpdateOperationsInput | string
    apiKey?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantUsageStatsUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    apiCalls?: IntFieldUpdateOperationsInput | number
    storageUsedMB?: IntFieldUpdateOperationsInput | number
    activeUsers?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageStatsUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    apiCalls?: IntFieldUpdateOperationsInput | number
    storageUsedMB?: IntFieldUpdateOperationsInput | number
    activeUsers?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageStatsUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    apiCalls?: IntFieldUpdateOperationsInput | number
    storageUsedMB?: IntFieldUpdateOperationsInput | number
    activeUsers?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}