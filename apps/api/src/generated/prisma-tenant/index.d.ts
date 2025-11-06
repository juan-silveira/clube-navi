
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
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model UserModule
 * 
 */
export type UserModule = $Result.DefaultSelection<Prisma.$UserModulePayload>
/**
 * Model UserCashbackConfig
 * 
 */
export type UserCashbackConfig = $Result.DefaultSelection<Prisma.$UserCashbackConfigPayload>
/**
 * Model UserPushToken
 * 
 */
export type UserPushToken = $Result.DefaultSelection<Prisma.$UserPushTokenPayload>
/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model Purchase
 * 
 */
export type Purchase = $Result.DefaultSelection<Prisma.$PurchasePayload>
/**
 * Model Campaign
 * 
 */
export type Campaign = $Result.DefaultSelection<Prisma.$CampaignPayload>
/**
 * Model Notification
 * 
 */
export type Notification = $Result.DefaultSelection<Prisma.$NotificationPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserType: {
  consumer: 'consumer',
  merchant: 'merchant'
};

export type UserType = (typeof UserType)[keyof typeof UserType]


export const MerchantStatus: {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  suspended: 'suspended'
};

export type MerchantStatus = (typeof MerchantStatus)[keyof typeof MerchantStatus]


export const AccountStatus: {
  active: 'active',
  suspended: 'suspended',
  blocked: 'blocked',
  deleted: 'deleted'
};

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus]


export const Platform: {
  ios: 'ios',
  android: 'android',
  web: 'web'
};

export type Platform = (typeof Platform)[keyof typeof Platform]


export const PurchaseStatus: {
  pending: 'pending',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed',
  refunded: 'refunded'
};

export type PurchaseStatus = (typeof PurchaseStatus)[keyof typeof PurchaseStatus]


export const CampaignType: {
  push: 'push',
  sms: 'sms',
  whatsapp: 'whatsapp',
  email: 'email'
};

export type CampaignType = (typeof CampaignType)[keyof typeof CampaignType]


export const CampaignStatus: {
  draft: 'draft',
  scheduled: 'scheduled',
  sending: 'sending',
  sent: 'sent',
  failed: 'failed',
  cancelled: 'cancelled'
};

export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus]


export const NotificationType: {
  purchase: 'purchase',
  cashback: 'cashback',
  referral: 'referral',
  system: 'system',
  promotion: 'promotion'
};

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

}

export type UserType = $Enums.UserType

export const UserType: typeof $Enums.UserType

export type MerchantStatus = $Enums.MerchantStatus

export const MerchantStatus: typeof $Enums.MerchantStatus

export type AccountStatus = $Enums.AccountStatus

export const AccountStatus: typeof $Enums.AccountStatus

export type Platform = $Enums.Platform

export const Platform: typeof $Enums.Platform

export type PurchaseStatus = $Enums.PurchaseStatus

export const PurchaseStatus: typeof $Enums.PurchaseStatus

export type CampaignType = $Enums.CampaignType

export const CampaignType: typeof $Enums.CampaignType

export type CampaignStatus = $Enums.CampaignStatus

export const CampaignStatus: typeof $Enums.CampaignStatus

export type NotificationType = $Enums.NotificationType

export const NotificationType: typeof $Enums.NotificationType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
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
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
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
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userModule`: Exposes CRUD operations for the **UserModule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserModules
    * const userModules = await prisma.userModule.findMany()
    * ```
    */
  get userModule(): Prisma.UserModuleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userCashbackConfig`: Exposes CRUD operations for the **UserCashbackConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserCashbackConfigs
    * const userCashbackConfigs = await prisma.userCashbackConfig.findMany()
    * ```
    */
  get userCashbackConfig(): Prisma.UserCashbackConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userPushToken`: Exposes CRUD operations for the **UserPushToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserPushTokens
    * const userPushTokens = await prisma.userPushToken.findMany()
    * ```
    */
  get userPushToken(): Prisma.UserPushTokenDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.purchase`: Exposes CRUD operations for the **Purchase** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Purchases
    * const purchases = await prisma.purchase.findMany()
    * ```
    */
  get purchase(): Prisma.PurchaseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.campaign`: Exposes CRUD operations for the **Campaign** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Campaigns
    * const campaigns = await prisma.campaign.findMany()
    * ```
    */
  get campaign(): Prisma.CampaignDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notification.findMany()
    * ```
    */
  get notification(): Prisma.NotificationDelegate<ExtArgs, ClientOptions>;
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
    User: 'User',
    UserModule: 'UserModule',
    UserCashbackConfig: 'UserCashbackConfig',
    UserPushToken: 'UserPushToken',
    Product: 'Product',
    Purchase: 'Purchase',
    Campaign: 'Campaign',
    Notification: 'Notification'
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
      modelProps: "user" | "userModule" | "userCashbackConfig" | "userPushToken" | "product" | "purchase" | "campaign" | "notification"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      UserModule: {
        payload: Prisma.$UserModulePayload<ExtArgs>
        fields: Prisma.UserModuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserModuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserModulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserModuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserModulePayload>
          }
          findFirst: {
            args: Prisma.UserModuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserModulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserModuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserModulePayload>
          }
          findMany: {
            args: Prisma.UserModuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserModulePayload>[]
          }
          create: {
            args: Prisma.UserModuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserModulePayload>
          }
          createMany: {
            args: Prisma.UserModuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserModuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserModulePayload>[]
          }
          delete: {
            args: Prisma.UserModuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserModulePayload>
          }
          update: {
            args: Prisma.UserModuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserModulePayload>
          }
          deleteMany: {
            args: Prisma.UserModuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserModuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserModuleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserModulePayload>[]
          }
          upsert: {
            args: Prisma.UserModuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserModulePayload>
          }
          aggregate: {
            args: Prisma.UserModuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserModule>
          }
          groupBy: {
            args: Prisma.UserModuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserModuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserModuleCountArgs<ExtArgs>
            result: $Utils.Optional<UserModuleCountAggregateOutputType> | number
          }
        }
      }
      UserCashbackConfig: {
        payload: Prisma.$UserCashbackConfigPayload<ExtArgs>
        fields: Prisma.UserCashbackConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserCashbackConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCashbackConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserCashbackConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCashbackConfigPayload>
          }
          findFirst: {
            args: Prisma.UserCashbackConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCashbackConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserCashbackConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCashbackConfigPayload>
          }
          findMany: {
            args: Prisma.UserCashbackConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCashbackConfigPayload>[]
          }
          create: {
            args: Prisma.UserCashbackConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCashbackConfigPayload>
          }
          createMany: {
            args: Prisma.UserCashbackConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCashbackConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCashbackConfigPayload>[]
          }
          delete: {
            args: Prisma.UserCashbackConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCashbackConfigPayload>
          }
          update: {
            args: Prisma.UserCashbackConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCashbackConfigPayload>
          }
          deleteMany: {
            args: Prisma.UserCashbackConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserCashbackConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserCashbackConfigUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCashbackConfigPayload>[]
          }
          upsert: {
            args: Prisma.UserCashbackConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCashbackConfigPayload>
          }
          aggregate: {
            args: Prisma.UserCashbackConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserCashbackConfig>
          }
          groupBy: {
            args: Prisma.UserCashbackConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserCashbackConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCashbackConfigCountArgs<ExtArgs>
            result: $Utils.Optional<UserCashbackConfigCountAggregateOutputType> | number
          }
        }
      }
      UserPushToken: {
        payload: Prisma.$UserPushTokenPayload<ExtArgs>
        fields: Prisma.UserPushTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserPushTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPushTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserPushTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPushTokenPayload>
          }
          findFirst: {
            args: Prisma.UserPushTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPushTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserPushTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPushTokenPayload>
          }
          findMany: {
            args: Prisma.UserPushTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPushTokenPayload>[]
          }
          create: {
            args: Prisma.UserPushTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPushTokenPayload>
          }
          createMany: {
            args: Prisma.UserPushTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserPushTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPushTokenPayload>[]
          }
          delete: {
            args: Prisma.UserPushTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPushTokenPayload>
          }
          update: {
            args: Prisma.UserPushTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPushTokenPayload>
          }
          deleteMany: {
            args: Prisma.UserPushTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserPushTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserPushTokenUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPushTokenPayload>[]
          }
          upsert: {
            args: Prisma.UserPushTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPushTokenPayload>
          }
          aggregate: {
            args: Prisma.UserPushTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserPushToken>
          }
          groupBy: {
            args: Prisma.UserPushTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserPushTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserPushTokenCountArgs<ExtArgs>
            result: $Utils.Optional<UserPushTokenCountAggregateOutputType> | number
          }
        }
      }
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProductUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      Purchase: {
        payload: Prisma.$PurchasePayload<ExtArgs>
        fields: Prisma.PurchaseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PurchaseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PurchaseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          findFirst: {
            args: Prisma.PurchaseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PurchaseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          findMany: {
            args: Prisma.PurchaseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>[]
          }
          create: {
            args: Prisma.PurchaseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          createMany: {
            args: Prisma.PurchaseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PurchaseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>[]
          }
          delete: {
            args: Prisma.PurchaseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          update: {
            args: Prisma.PurchaseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          deleteMany: {
            args: Prisma.PurchaseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PurchaseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PurchaseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>[]
          }
          upsert: {
            args: Prisma.PurchaseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchasePayload>
          }
          aggregate: {
            args: Prisma.PurchaseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePurchase>
          }
          groupBy: {
            args: Prisma.PurchaseGroupByArgs<ExtArgs>
            result: $Utils.Optional<PurchaseGroupByOutputType>[]
          }
          count: {
            args: Prisma.PurchaseCountArgs<ExtArgs>
            result: $Utils.Optional<PurchaseCountAggregateOutputType> | number
          }
        }
      }
      Campaign: {
        payload: Prisma.$CampaignPayload<ExtArgs>
        fields: Prisma.CampaignFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CampaignFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CampaignFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          findFirst: {
            args: Prisma.CampaignFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CampaignFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          findMany: {
            args: Prisma.CampaignFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>[]
          }
          create: {
            args: Prisma.CampaignCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          createMany: {
            args: Prisma.CampaignCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CampaignCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>[]
          }
          delete: {
            args: Prisma.CampaignDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          update: {
            args: Prisma.CampaignUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          deleteMany: {
            args: Prisma.CampaignDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CampaignUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CampaignUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>[]
          }
          upsert: {
            args: Prisma.CampaignUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CampaignPayload>
          }
          aggregate: {
            args: Prisma.CampaignAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCampaign>
          }
          groupBy: {
            args: Prisma.CampaignGroupByArgs<ExtArgs>
            result: $Utils.Optional<CampaignGroupByOutputType>[]
          }
          count: {
            args: Prisma.CampaignCountArgs<ExtArgs>
            result: $Utils.Optional<CampaignCountAggregateOutputType> | number
          }
        }
      }
      Notification: {
        payload: Prisma.$NotificationPayload<ExtArgs>
        fields: Prisma.NotificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findFirst: {
            args: Prisma.NotificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findMany: {
            args: Prisma.NotificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          create: {
            args: Prisma.NotificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          createMany: {
            args: Prisma.NotificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          delete: {
            args: Prisma.NotificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          update: {
            args: Prisma.NotificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NotificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          upsert: {
            args: Prisma.NotificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          aggregate: {
            args: Prisma.NotificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotification>
          }
          groupBy: {
            args: Prisma.NotificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationCountAggregateOutputType> | number
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
    user?: UserOmit
    userModule?: UserModuleOmit
    userCashbackConfig?: UserCashbackConfigOmit
    userPushToken?: UserPushTokenOmit
    product?: ProductOmit
    purchase?: PurchaseOmit
    campaign?: CampaignOmit
    notification?: NotificationOmit
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
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    products: number
    purchases: number
    sales: number
    pushTokens: number
    notifications: number
    userModules: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | UserCountOutputTypeCountProductsArgs
    purchases?: boolean | UserCountOutputTypeCountPurchasesArgs
    sales?: boolean | UserCountOutputTypeCountSalesArgs
    pushTokens?: boolean | UserCountOutputTypeCountPushTokensArgs
    notifications?: boolean | UserCountOutputTypeCountNotificationsArgs
    userModules?: boolean | UserCountOutputTypeCountUserModulesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPurchasesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSalesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPushTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserPushTokenWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountNotificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserModulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserModuleWhereInput
  }


  /**
   * Count Type ProductCountOutputType
   */

  export type ProductCountOutputType = {
    purchases: number
  }

  export type ProductCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    purchases?: boolean | ProductCountOutputTypeCountPurchasesArgs
  }

  // Custom InputTypes
  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCountOutputType
     */
    select?: ProductCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountPurchasesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    failedLoginAttempts: number | null
  }

  export type UserSumAggregateOutputType = {
    failedLoginAttempts: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    username: string | null
    cpf: string | null
    phone: string | null
    birthDate: Date | null
    password: string | null
    passwordChangedAt: Date | null
    profilePicture: string | null
    userType: $Enums.UserType | null
    merchantStatus: $Enums.MerchantStatus | null
    publicKey: string | null
    privateKey: string | null
    referralId: string | null
    referredBy: string | null
    isActive: boolean | null
    accountStatus: $Enums.AccountStatus | null
    lastLoginAt: Date | null
    emailConfirmed: boolean | null
    failedLoginAttempts: number | null
    lastFailedLoginAt: Date | null
    isBlockedLoginAttempts: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    username: string | null
    cpf: string | null
    phone: string | null
    birthDate: Date | null
    password: string | null
    passwordChangedAt: Date | null
    profilePicture: string | null
    userType: $Enums.UserType | null
    merchantStatus: $Enums.MerchantStatus | null
    publicKey: string | null
    privateKey: string | null
    referralId: string | null
    referredBy: string | null
    isActive: boolean | null
    accountStatus: $Enums.AccountStatus | null
    lastLoginAt: Date | null
    emailConfirmed: boolean | null
    failedLoginAttempts: number | null
    lastFailedLoginAt: Date | null
    isBlockedLoginAttempts: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    firstName: number
    lastName: number
    email: number
    username: number
    cpf: number
    phone: number
    birthDate: number
    password: number
    passwordChangedAt: number
    profilePicture: number
    userType: number
    merchantStatus: number
    publicKey: number
    privateKey: number
    referralId: number
    referredBy: number
    address: number
    isActive: number
    accountStatus: number
    lastLoginAt: number
    emailConfirmed: number
    failedLoginAttempts: number
    lastFailedLoginAt: number
    isBlockedLoginAttempts: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    failedLoginAttempts?: true
  }

  export type UserSumAggregateInputType = {
    failedLoginAttempts?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    username?: true
    cpf?: true
    phone?: true
    birthDate?: true
    password?: true
    passwordChangedAt?: true
    profilePicture?: true
    userType?: true
    merchantStatus?: true
    publicKey?: true
    privateKey?: true
    referralId?: true
    referredBy?: true
    isActive?: true
    accountStatus?: true
    lastLoginAt?: true
    emailConfirmed?: true
    failedLoginAttempts?: true
    lastFailedLoginAt?: true
    isBlockedLoginAttempts?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    username?: true
    cpf?: true
    phone?: true
    birthDate?: true
    password?: true
    passwordChangedAt?: true
    profilePicture?: true
    userType?: true
    merchantStatus?: true
    publicKey?: true
    privateKey?: true
    referralId?: true
    referredBy?: true
    isActive?: true
    accountStatus?: true
    lastLoginAt?: true
    emailConfirmed?: true
    failedLoginAttempts?: true
    lastFailedLoginAt?: true
    isBlockedLoginAttempts?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    username?: true
    cpf?: true
    phone?: true
    birthDate?: true
    password?: true
    passwordChangedAt?: true
    profilePicture?: true
    userType?: true
    merchantStatus?: true
    publicKey?: true
    privateKey?: true
    referralId?: true
    referredBy?: true
    address?: true
    isActive?: true
    accountStatus?: true
    lastLoginAt?: true
    emailConfirmed?: true
    failedLoginAttempts?: true
    lastFailedLoginAt?: true
    isBlockedLoginAttempts?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone: string | null
    birthDate: Date | null
    password: string
    passwordChangedAt: Date | null
    profilePicture: string | null
    userType: $Enums.UserType
    merchantStatus: $Enums.MerchantStatus | null
    publicKey: string | null
    privateKey: string | null
    referralId: string | null
    referredBy: string | null
    address: JsonValue | null
    isActive: boolean
    accountStatus: $Enums.AccountStatus
    lastLoginAt: Date | null
    emailConfirmed: boolean
    failedLoginAttempts: number
    lastFailedLoginAt: Date | null
    isBlockedLoginAttempts: boolean
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    username?: boolean
    cpf?: boolean
    phone?: boolean
    birthDate?: boolean
    password?: boolean
    passwordChangedAt?: boolean
    profilePicture?: boolean
    userType?: boolean
    merchantStatus?: boolean
    publicKey?: boolean
    privateKey?: boolean
    referralId?: boolean
    referredBy?: boolean
    address?: boolean
    isActive?: boolean
    accountStatus?: boolean
    lastLoginAt?: boolean
    emailConfirmed?: boolean
    failedLoginAttempts?: boolean
    lastFailedLoginAt?: boolean
    isBlockedLoginAttempts?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    products?: boolean | User$productsArgs<ExtArgs>
    purchases?: boolean | User$purchasesArgs<ExtArgs>
    sales?: boolean | User$salesArgs<ExtArgs>
    pushTokens?: boolean | User$pushTokensArgs<ExtArgs>
    notifications?: boolean | User$notificationsArgs<ExtArgs>
    userModules?: boolean | User$userModulesArgs<ExtArgs>
    cashbackConfig?: boolean | User$cashbackConfigArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    username?: boolean
    cpf?: boolean
    phone?: boolean
    birthDate?: boolean
    password?: boolean
    passwordChangedAt?: boolean
    profilePicture?: boolean
    userType?: boolean
    merchantStatus?: boolean
    publicKey?: boolean
    privateKey?: boolean
    referralId?: boolean
    referredBy?: boolean
    address?: boolean
    isActive?: boolean
    accountStatus?: boolean
    lastLoginAt?: boolean
    emailConfirmed?: boolean
    failedLoginAttempts?: boolean
    lastFailedLoginAt?: boolean
    isBlockedLoginAttempts?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    username?: boolean
    cpf?: boolean
    phone?: boolean
    birthDate?: boolean
    password?: boolean
    passwordChangedAt?: boolean
    profilePicture?: boolean
    userType?: boolean
    merchantStatus?: boolean
    publicKey?: boolean
    privateKey?: boolean
    referralId?: boolean
    referredBy?: boolean
    address?: boolean
    isActive?: boolean
    accountStatus?: boolean
    lastLoginAt?: boolean
    emailConfirmed?: boolean
    failedLoginAttempts?: boolean
    lastFailedLoginAt?: boolean
    isBlockedLoginAttempts?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    username?: boolean
    cpf?: boolean
    phone?: boolean
    birthDate?: boolean
    password?: boolean
    passwordChangedAt?: boolean
    profilePicture?: boolean
    userType?: boolean
    merchantStatus?: boolean
    publicKey?: boolean
    privateKey?: boolean
    referralId?: boolean
    referredBy?: boolean
    address?: boolean
    isActive?: boolean
    accountStatus?: boolean
    lastLoginAt?: boolean
    emailConfirmed?: boolean
    failedLoginAttempts?: boolean
    lastFailedLoginAt?: boolean
    isBlockedLoginAttempts?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "firstName" | "lastName" | "email" | "username" | "cpf" | "phone" | "birthDate" | "password" | "passwordChangedAt" | "profilePicture" | "userType" | "merchantStatus" | "publicKey" | "privateKey" | "referralId" | "referredBy" | "address" | "isActive" | "accountStatus" | "lastLoginAt" | "emailConfirmed" | "failedLoginAttempts" | "lastFailedLoginAt" | "isBlockedLoginAttempts" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | User$productsArgs<ExtArgs>
    purchases?: boolean | User$purchasesArgs<ExtArgs>
    sales?: boolean | User$salesArgs<ExtArgs>
    pushTokens?: boolean | User$pushTokensArgs<ExtArgs>
    notifications?: boolean | User$notificationsArgs<ExtArgs>
    userModules?: boolean | User$userModulesArgs<ExtArgs>
    cashbackConfig?: boolean | User$cashbackConfigArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      products: Prisma.$ProductPayload<ExtArgs>[]
      purchases: Prisma.$PurchasePayload<ExtArgs>[]
      sales: Prisma.$PurchasePayload<ExtArgs>[]
      pushTokens: Prisma.$UserPushTokenPayload<ExtArgs>[]
      notifications: Prisma.$NotificationPayload<ExtArgs>[]
      userModules: Prisma.$UserModulePayload<ExtArgs>[]
      cashbackConfig: Prisma.$UserCashbackConfigPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      firstName: string
      lastName: string
      email: string
      username: string
      cpf: string
      phone: string | null
      birthDate: Date | null
      password: string
      passwordChangedAt: Date | null
      profilePicture: string | null
      userType: $Enums.UserType
      merchantStatus: $Enums.MerchantStatus | null
      publicKey: string | null
      privateKey: string | null
      referralId: string | null
      referredBy: string | null
      address: Prisma.JsonValue | null
      isActive: boolean
      accountStatus: $Enums.AccountStatus
      lastLoginAt: Date | null
      emailConfirmed: boolean
      failedLoginAttempts: number
      lastFailedLoginAt: Date | null
      isBlockedLoginAttempts: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
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
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
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
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    products<T extends User$productsArgs<ExtArgs> = {}>(args?: Subset<T, User$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    purchases<T extends User$purchasesArgs<ExtArgs> = {}>(args?: Subset<T, User$purchasesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    sales<T extends User$salesArgs<ExtArgs> = {}>(args?: Subset<T, User$salesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    pushTokens<T extends User$pushTokensArgs<ExtArgs> = {}>(args?: Subset<T, User$pushTokensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    notifications<T extends User$notificationsArgs<ExtArgs> = {}>(args?: Subset<T, User$notificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    userModules<T extends User$userModulesArgs<ExtArgs> = {}>(args?: Subset<T, User$userModulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cashbackConfig<T extends User$cashbackConfigArgs<ExtArgs> = {}>(args?: Subset<T, User$cashbackConfigArgs<ExtArgs>>): Prisma__UserCashbackConfigClient<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly cpf: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly birthDate: FieldRef<"User", 'DateTime'>
    readonly password: FieldRef<"User", 'String'>
    readonly passwordChangedAt: FieldRef<"User", 'DateTime'>
    readonly profilePicture: FieldRef<"User", 'String'>
    readonly userType: FieldRef<"User", 'UserType'>
    readonly merchantStatus: FieldRef<"User", 'MerchantStatus'>
    readonly publicKey: FieldRef<"User", 'String'>
    readonly privateKey: FieldRef<"User", 'String'>
    readonly referralId: FieldRef<"User", 'String'>
    readonly referredBy: FieldRef<"User", 'String'>
    readonly address: FieldRef<"User", 'Json'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly accountStatus: FieldRef<"User", 'AccountStatus'>
    readonly lastLoginAt: FieldRef<"User", 'DateTime'>
    readonly emailConfirmed: FieldRef<"User", 'Boolean'>
    readonly failedLoginAttempts: FieldRef<"User", 'Int'>
    readonly lastFailedLoginAt: FieldRef<"User", 'DateTime'>
    readonly isBlockedLoginAttempts: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.products
   */
  export type User$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    cursor?: ProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * User.purchases
   */
  export type User$purchasesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    where?: PurchaseWhereInput
    orderBy?: PurchaseOrderByWithRelationInput | PurchaseOrderByWithRelationInput[]
    cursor?: PurchaseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PurchaseScalarFieldEnum | PurchaseScalarFieldEnum[]
  }

  /**
   * User.sales
   */
  export type User$salesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    where?: PurchaseWhereInput
    orderBy?: PurchaseOrderByWithRelationInput | PurchaseOrderByWithRelationInput[]
    cursor?: PurchaseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PurchaseScalarFieldEnum | PurchaseScalarFieldEnum[]
  }

  /**
   * User.pushTokens
   */
  export type User$pushTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenInclude<ExtArgs> | null
    where?: UserPushTokenWhereInput
    orderBy?: UserPushTokenOrderByWithRelationInput | UserPushTokenOrderByWithRelationInput[]
    cursor?: UserPushTokenWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserPushTokenScalarFieldEnum | UserPushTokenScalarFieldEnum[]
  }

  /**
   * User.notifications
   */
  export type User$notificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    cursor?: NotificationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * User.userModules
   */
  export type User$userModulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleInclude<ExtArgs> | null
    where?: UserModuleWhereInput
    orderBy?: UserModuleOrderByWithRelationInput | UserModuleOrderByWithRelationInput[]
    cursor?: UserModuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserModuleScalarFieldEnum | UserModuleScalarFieldEnum[]
  }

  /**
   * User.cashbackConfig
   */
  export type User$cashbackConfigArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigInclude<ExtArgs> | null
    where?: UserCashbackConfigWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model UserModule
   */

  export type AggregateUserModule = {
    _count: UserModuleCountAggregateOutputType | null
    _min: UserModuleMinAggregateOutputType | null
    _max: UserModuleMaxAggregateOutputType | null
  }

  export type UserModuleMinAggregateOutputType = {
    id: string | null
    userId: string | null
    moduleKey: string | null
    isEnabled: boolean | null
    reason: string | null
    enabledBy: string | null
    disabledBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserModuleMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    moduleKey: string | null
    isEnabled: boolean | null
    reason: string | null
    enabledBy: string | null
    disabledBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserModuleCountAggregateOutputType = {
    id: number
    userId: number
    moduleKey: number
    isEnabled: number
    reason: number
    enabledBy: number
    disabledBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserModuleMinAggregateInputType = {
    id?: true
    userId?: true
    moduleKey?: true
    isEnabled?: true
    reason?: true
    enabledBy?: true
    disabledBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserModuleMaxAggregateInputType = {
    id?: true
    userId?: true
    moduleKey?: true
    isEnabled?: true
    reason?: true
    enabledBy?: true
    disabledBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserModuleCountAggregateInputType = {
    id?: true
    userId?: true
    moduleKey?: true
    isEnabled?: true
    reason?: true
    enabledBy?: true
    disabledBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserModuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserModule to aggregate.
     */
    where?: UserModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserModules to fetch.
     */
    orderBy?: UserModuleOrderByWithRelationInput | UserModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserModules
    **/
    _count?: true | UserModuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserModuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserModuleMaxAggregateInputType
  }

  export type GetUserModuleAggregateType<T extends UserModuleAggregateArgs> = {
        [P in keyof T & keyof AggregateUserModule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserModule[P]>
      : GetScalarType<T[P], AggregateUserModule[P]>
  }




  export type UserModuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserModuleWhereInput
    orderBy?: UserModuleOrderByWithAggregationInput | UserModuleOrderByWithAggregationInput[]
    by: UserModuleScalarFieldEnum[] | UserModuleScalarFieldEnum
    having?: UserModuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserModuleCountAggregateInputType | true
    _min?: UserModuleMinAggregateInputType
    _max?: UserModuleMaxAggregateInputType
  }

  export type UserModuleGroupByOutputType = {
    id: string
    userId: string
    moduleKey: string
    isEnabled: boolean
    reason: string | null
    enabledBy: string | null
    disabledBy: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserModuleCountAggregateOutputType | null
    _min: UserModuleMinAggregateOutputType | null
    _max: UserModuleMaxAggregateOutputType | null
  }

  type GetUserModuleGroupByPayload<T extends UserModuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserModuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserModuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserModuleGroupByOutputType[P]>
            : GetScalarType<T[P], UserModuleGroupByOutputType[P]>
        }
      >
    >


  export type UserModuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    moduleKey?: boolean
    isEnabled?: boolean
    reason?: boolean
    enabledBy?: boolean
    disabledBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userModule"]>

  export type UserModuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    moduleKey?: boolean
    isEnabled?: boolean
    reason?: boolean
    enabledBy?: boolean
    disabledBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userModule"]>

  export type UserModuleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    moduleKey?: boolean
    isEnabled?: boolean
    reason?: boolean
    enabledBy?: boolean
    disabledBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userModule"]>

  export type UserModuleSelectScalar = {
    id?: boolean
    userId?: boolean
    moduleKey?: boolean
    isEnabled?: boolean
    reason?: boolean
    enabledBy?: boolean
    disabledBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserModuleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "moduleKey" | "isEnabled" | "reason" | "enabledBy" | "disabledBy" | "createdAt" | "updatedAt", ExtArgs["result"]["userModule"]>
  export type UserModuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserModuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserModuleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserModulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserModule"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      moduleKey: string
      isEnabled: boolean
      reason: string | null
      enabledBy: string | null
      disabledBy: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userModule"]>
    composites: {}
  }

  type UserModuleGetPayload<S extends boolean | null | undefined | UserModuleDefaultArgs> = $Result.GetResult<Prisma.$UserModulePayload, S>

  type UserModuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserModuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserModuleCountAggregateInputType | true
    }

  export interface UserModuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserModule'], meta: { name: 'UserModule' } }
    /**
     * Find zero or one UserModule that matches the filter.
     * @param {UserModuleFindUniqueArgs} args - Arguments to find a UserModule
     * @example
     * // Get one UserModule
     * const userModule = await prisma.userModule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserModuleFindUniqueArgs>(args: SelectSubset<T, UserModuleFindUniqueArgs<ExtArgs>>): Prisma__UserModuleClient<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserModule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserModuleFindUniqueOrThrowArgs} args - Arguments to find a UserModule
     * @example
     * // Get one UserModule
     * const userModule = await prisma.userModule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserModuleFindUniqueOrThrowArgs>(args: SelectSubset<T, UserModuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserModuleClient<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserModule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserModuleFindFirstArgs} args - Arguments to find a UserModule
     * @example
     * // Get one UserModule
     * const userModule = await prisma.userModule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserModuleFindFirstArgs>(args?: SelectSubset<T, UserModuleFindFirstArgs<ExtArgs>>): Prisma__UserModuleClient<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserModule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserModuleFindFirstOrThrowArgs} args - Arguments to find a UserModule
     * @example
     * // Get one UserModule
     * const userModule = await prisma.userModule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserModuleFindFirstOrThrowArgs>(args?: SelectSubset<T, UserModuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserModuleClient<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserModules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserModuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserModules
     * const userModules = await prisma.userModule.findMany()
     * 
     * // Get first 10 UserModules
     * const userModules = await prisma.userModule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userModuleWithIdOnly = await prisma.userModule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserModuleFindManyArgs>(args?: SelectSubset<T, UserModuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserModule.
     * @param {UserModuleCreateArgs} args - Arguments to create a UserModule.
     * @example
     * // Create one UserModule
     * const UserModule = await prisma.userModule.create({
     *   data: {
     *     // ... data to create a UserModule
     *   }
     * })
     * 
     */
    create<T extends UserModuleCreateArgs>(args: SelectSubset<T, UserModuleCreateArgs<ExtArgs>>): Prisma__UserModuleClient<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserModules.
     * @param {UserModuleCreateManyArgs} args - Arguments to create many UserModules.
     * @example
     * // Create many UserModules
     * const userModule = await prisma.userModule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserModuleCreateManyArgs>(args?: SelectSubset<T, UserModuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserModules and returns the data saved in the database.
     * @param {UserModuleCreateManyAndReturnArgs} args - Arguments to create many UserModules.
     * @example
     * // Create many UserModules
     * const userModule = await prisma.userModule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserModules and only return the `id`
     * const userModuleWithIdOnly = await prisma.userModule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserModuleCreateManyAndReturnArgs>(args?: SelectSubset<T, UserModuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserModule.
     * @param {UserModuleDeleteArgs} args - Arguments to delete one UserModule.
     * @example
     * // Delete one UserModule
     * const UserModule = await prisma.userModule.delete({
     *   where: {
     *     // ... filter to delete one UserModule
     *   }
     * })
     * 
     */
    delete<T extends UserModuleDeleteArgs>(args: SelectSubset<T, UserModuleDeleteArgs<ExtArgs>>): Prisma__UserModuleClient<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserModule.
     * @param {UserModuleUpdateArgs} args - Arguments to update one UserModule.
     * @example
     * // Update one UserModule
     * const userModule = await prisma.userModule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserModuleUpdateArgs>(args: SelectSubset<T, UserModuleUpdateArgs<ExtArgs>>): Prisma__UserModuleClient<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserModules.
     * @param {UserModuleDeleteManyArgs} args - Arguments to filter UserModules to delete.
     * @example
     * // Delete a few UserModules
     * const { count } = await prisma.userModule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserModuleDeleteManyArgs>(args?: SelectSubset<T, UserModuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserModuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserModules
     * const userModule = await prisma.userModule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserModuleUpdateManyArgs>(args: SelectSubset<T, UserModuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserModules and returns the data updated in the database.
     * @param {UserModuleUpdateManyAndReturnArgs} args - Arguments to update many UserModules.
     * @example
     * // Update many UserModules
     * const userModule = await prisma.userModule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserModules and only return the `id`
     * const userModuleWithIdOnly = await prisma.userModule.updateManyAndReturn({
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
    updateManyAndReturn<T extends UserModuleUpdateManyAndReturnArgs>(args: SelectSubset<T, UserModuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserModule.
     * @param {UserModuleUpsertArgs} args - Arguments to update or create a UserModule.
     * @example
     * // Update or create a UserModule
     * const userModule = await prisma.userModule.upsert({
     *   create: {
     *     // ... data to create a UserModule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserModule we want to update
     *   }
     * })
     */
    upsert<T extends UserModuleUpsertArgs>(args: SelectSubset<T, UserModuleUpsertArgs<ExtArgs>>): Prisma__UserModuleClient<$Result.GetResult<Prisma.$UserModulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserModuleCountArgs} args - Arguments to filter UserModules to count.
     * @example
     * // Count the number of UserModules
     * const count = await prisma.userModule.count({
     *   where: {
     *     // ... the filter for the UserModules we want to count
     *   }
     * })
    **/
    count<T extends UserModuleCountArgs>(
      args?: Subset<T, UserModuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserModuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserModuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserModuleAggregateArgs>(args: Subset<T, UserModuleAggregateArgs>): Prisma.PrismaPromise<GetUserModuleAggregateType<T>>

    /**
     * Group by UserModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserModuleGroupByArgs} args - Group by arguments.
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
      T extends UserModuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserModuleGroupByArgs['orderBy'] }
        : { orderBy?: UserModuleGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserModuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserModuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserModule model
   */
  readonly fields: UserModuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserModule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserModuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the UserModule model
   */
  interface UserModuleFieldRefs {
    readonly id: FieldRef<"UserModule", 'String'>
    readonly userId: FieldRef<"UserModule", 'String'>
    readonly moduleKey: FieldRef<"UserModule", 'String'>
    readonly isEnabled: FieldRef<"UserModule", 'Boolean'>
    readonly reason: FieldRef<"UserModule", 'String'>
    readonly enabledBy: FieldRef<"UserModule", 'String'>
    readonly disabledBy: FieldRef<"UserModule", 'String'>
    readonly createdAt: FieldRef<"UserModule", 'DateTime'>
    readonly updatedAt: FieldRef<"UserModule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserModule findUnique
   */
  export type UserModuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleInclude<ExtArgs> | null
    /**
     * Filter, which UserModule to fetch.
     */
    where: UserModuleWhereUniqueInput
  }

  /**
   * UserModule findUniqueOrThrow
   */
  export type UserModuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleInclude<ExtArgs> | null
    /**
     * Filter, which UserModule to fetch.
     */
    where: UserModuleWhereUniqueInput
  }

  /**
   * UserModule findFirst
   */
  export type UserModuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleInclude<ExtArgs> | null
    /**
     * Filter, which UserModule to fetch.
     */
    where?: UserModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserModules to fetch.
     */
    orderBy?: UserModuleOrderByWithRelationInput | UserModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserModules.
     */
    cursor?: UserModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserModules.
     */
    distinct?: UserModuleScalarFieldEnum | UserModuleScalarFieldEnum[]
  }

  /**
   * UserModule findFirstOrThrow
   */
  export type UserModuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleInclude<ExtArgs> | null
    /**
     * Filter, which UserModule to fetch.
     */
    where?: UserModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserModules to fetch.
     */
    orderBy?: UserModuleOrderByWithRelationInput | UserModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserModules.
     */
    cursor?: UserModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserModules.
     */
    distinct?: UserModuleScalarFieldEnum | UserModuleScalarFieldEnum[]
  }

  /**
   * UserModule findMany
   */
  export type UserModuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleInclude<ExtArgs> | null
    /**
     * Filter, which UserModules to fetch.
     */
    where?: UserModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserModules to fetch.
     */
    orderBy?: UserModuleOrderByWithRelationInput | UserModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserModules.
     */
    cursor?: UserModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserModules.
     */
    skip?: number
    distinct?: UserModuleScalarFieldEnum | UserModuleScalarFieldEnum[]
  }

  /**
   * UserModule create
   */
  export type UserModuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleInclude<ExtArgs> | null
    /**
     * The data needed to create a UserModule.
     */
    data: XOR<UserModuleCreateInput, UserModuleUncheckedCreateInput>
  }

  /**
   * UserModule createMany
   */
  export type UserModuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserModules.
     */
    data: UserModuleCreateManyInput | UserModuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserModule createManyAndReturn
   */
  export type UserModuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * The data used to create many UserModules.
     */
    data: UserModuleCreateManyInput | UserModuleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserModule update
   */
  export type UserModuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleInclude<ExtArgs> | null
    /**
     * The data needed to update a UserModule.
     */
    data: XOR<UserModuleUpdateInput, UserModuleUncheckedUpdateInput>
    /**
     * Choose, which UserModule to update.
     */
    where: UserModuleWhereUniqueInput
  }

  /**
   * UserModule updateMany
   */
  export type UserModuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserModules.
     */
    data: XOR<UserModuleUpdateManyMutationInput, UserModuleUncheckedUpdateManyInput>
    /**
     * Filter which UserModules to update
     */
    where?: UserModuleWhereInput
    /**
     * Limit how many UserModules to update.
     */
    limit?: number
  }

  /**
   * UserModule updateManyAndReturn
   */
  export type UserModuleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * The data used to update UserModules.
     */
    data: XOR<UserModuleUpdateManyMutationInput, UserModuleUncheckedUpdateManyInput>
    /**
     * Filter which UserModules to update
     */
    where?: UserModuleWhereInput
    /**
     * Limit how many UserModules to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserModule upsert
   */
  export type UserModuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleInclude<ExtArgs> | null
    /**
     * The filter to search for the UserModule to update in case it exists.
     */
    where: UserModuleWhereUniqueInput
    /**
     * In case the UserModule found by the `where` argument doesn't exist, create a new UserModule with this data.
     */
    create: XOR<UserModuleCreateInput, UserModuleUncheckedCreateInput>
    /**
     * In case the UserModule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserModuleUpdateInput, UserModuleUncheckedUpdateInput>
  }

  /**
   * UserModule delete
   */
  export type UserModuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleInclude<ExtArgs> | null
    /**
     * Filter which UserModule to delete.
     */
    where: UserModuleWhereUniqueInput
  }

  /**
   * UserModule deleteMany
   */
  export type UserModuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserModules to delete
     */
    where?: UserModuleWhereInput
    /**
     * Limit how many UserModules to delete.
     */
    limit?: number
  }

  /**
   * UserModule without action
   */
  export type UserModuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserModule
     */
    select?: UserModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserModule
     */
    omit?: UserModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserModuleInclude<ExtArgs> | null
  }


  /**
   * Model UserCashbackConfig
   */

  export type AggregateUserCashbackConfig = {
    _count: UserCashbackConfigCountAggregateOutputType | null
    _avg: UserCashbackConfigAvgAggregateOutputType | null
    _sum: UserCashbackConfigSumAggregateOutputType | null
    _min: UserCashbackConfigMinAggregateOutputType | null
    _max: UserCashbackConfigMaxAggregateOutputType | null
  }

  export type UserCashbackConfigAvgAggregateOutputType = {
    consumerPercent: Decimal | null
    clubPercent: Decimal | null
    consumerReferrerPercent: Decimal | null
    merchantReferrerPercent: Decimal | null
  }

  export type UserCashbackConfigSumAggregateOutputType = {
    consumerPercent: Decimal | null
    clubPercent: Decimal | null
    consumerReferrerPercent: Decimal | null
    merchantReferrerPercent: Decimal | null
  }

  export type UserCashbackConfigMinAggregateOutputType = {
    id: string | null
    userId: string | null
    consumerPercent: Decimal | null
    clubPercent: Decimal | null
    consumerReferrerPercent: Decimal | null
    merchantReferrerPercent: Decimal | null
    reason: string | null
    configuredBy: string | null
    configuredAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCashbackConfigMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    consumerPercent: Decimal | null
    clubPercent: Decimal | null
    consumerReferrerPercent: Decimal | null
    merchantReferrerPercent: Decimal | null
    reason: string | null
    configuredBy: string | null
    configuredAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCashbackConfigCountAggregateOutputType = {
    id: number
    userId: number
    consumerPercent: number
    clubPercent: number
    consumerReferrerPercent: number
    merchantReferrerPercent: number
    reason: number
    configuredBy: number
    configuredAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserCashbackConfigAvgAggregateInputType = {
    consumerPercent?: true
    clubPercent?: true
    consumerReferrerPercent?: true
    merchantReferrerPercent?: true
  }

  export type UserCashbackConfigSumAggregateInputType = {
    consumerPercent?: true
    clubPercent?: true
    consumerReferrerPercent?: true
    merchantReferrerPercent?: true
  }

  export type UserCashbackConfigMinAggregateInputType = {
    id?: true
    userId?: true
    consumerPercent?: true
    clubPercent?: true
    consumerReferrerPercent?: true
    merchantReferrerPercent?: true
    reason?: true
    configuredBy?: true
    configuredAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCashbackConfigMaxAggregateInputType = {
    id?: true
    userId?: true
    consumerPercent?: true
    clubPercent?: true
    consumerReferrerPercent?: true
    merchantReferrerPercent?: true
    reason?: true
    configuredBy?: true
    configuredAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCashbackConfigCountAggregateInputType = {
    id?: true
    userId?: true
    consumerPercent?: true
    clubPercent?: true
    consumerReferrerPercent?: true
    merchantReferrerPercent?: true
    reason?: true
    configuredBy?: true
    configuredAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserCashbackConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserCashbackConfig to aggregate.
     */
    where?: UserCashbackConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCashbackConfigs to fetch.
     */
    orderBy?: UserCashbackConfigOrderByWithRelationInput | UserCashbackConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserCashbackConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCashbackConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCashbackConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserCashbackConfigs
    **/
    _count?: true | UserCashbackConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserCashbackConfigAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserCashbackConfigSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserCashbackConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserCashbackConfigMaxAggregateInputType
  }

  export type GetUserCashbackConfigAggregateType<T extends UserCashbackConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateUserCashbackConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserCashbackConfig[P]>
      : GetScalarType<T[P], AggregateUserCashbackConfig[P]>
  }




  export type UserCashbackConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserCashbackConfigWhereInput
    orderBy?: UserCashbackConfigOrderByWithAggregationInput | UserCashbackConfigOrderByWithAggregationInput[]
    by: UserCashbackConfigScalarFieldEnum[] | UserCashbackConfigScalarFieldEnum
    having?: UserCashbackConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCashbackConfigCountAggregateInputType | true
    _avg?: UserCashbackConfigAvgAggregateInputType
    _sum?: UserCashbackConfigSumAggregateInputType
    _min?: UserCashbackConfigMinAggregateInputType
    _max?: UserCashbackConfigMaxAggregateInputType
  }

  export type UserCashbackConfigGroupByOutputType = {
    id: string
    userId: string
    consumerPercent: Decimal
    clubPercent: Decimal
    consumerReferrerPercent: Decimal
    merchantReferrerPercent: Decimal
    reason: string | null
    configuredBy: string | null
    configuredAt: Date
    createdAt: Date
    updatedAt: Date
    _count: UserCashbackConfigCountAggregateOutputType | null
    _avg: UserCashbackConfigAvgAggregateOutputType | null
    _sum: UserCashbackConfigSumAggregateOutputType | null
    _min: UserCashbackConfigMinAggregateOutputType | null
    _max: UserCashbackConfigMaxAggregateOutputType | null
  }

  type GetUserCashbackConfigGroupByPayload<T extends UserCashbackConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserCashbackConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserCashbackConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserCashbackConfigGroupByOutputType[P]>
            : GetScalarType<T[P], UserCashbackConfigGroupByOutputType[P]>
        }
      >
    >


  export type UserCashbackConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    consumerPercent?: boolean
    clubPercent?: boolean
    consumerReferrerPercent?: boolean
    merchantReferrerPercent?: boolean
    reason?: boolean
    configuredBy?: boolean
    configuredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCashbackConfig"]>

  export type UserCashbackConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    consumerPercent?: boolean
    clubPercent?: boolean
    consumerReferrerPercent?: boolean
    merchantReferrerPercent?: boolean
    reason?: boolean
    configuredBy?: boolean
    configuredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCashbackConfig"]>

  export type UserCashbackConfigSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    consumerPercent?: boolean
    clubPercent?: boolean
    consumerReferrerPercent?: boolean
    merchantReferrerPercent?: boolean
    reason?: boolean
    configuredBy?: boolean
    configuredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCashbackConfig"]>

  export type UserCashbackConfigSelectScalar = {
    id?: boolean
    userId?: boolean
    consumerPercent?: boolean
    clubPercent?: boolean
    consumerReferrerPercent?: boolean
    merchantReferrerPercent?: boolean
    reason?: boolean
    configuredBy?: boolean
    configuredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserCashbackConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "consumerPercent" | "clubPercent" | "consumerReferrerPercent" | "merchantReferrerPercent" | "reason" | "configuredBy" | "configuredAt" | "createdAt" | "updatedAt", ExtArgs["result"]["userCashbackConfig"]>
  export type UserCashbackConfigInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserCashbackConfigIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserCashbackConfigIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserCashbackConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserCashbackConfig"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      consumerPercent: Prisma.Decimal
      clubPercent: Prisma.Decimal
      consumerReferrerPercent: Prisma.Decimal
      merchantReferrerPercent: Prisma.Decimal
      reason: string | null
      configuredBy: string | null
      configuredAt: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userCashbackConfig"]>
    composites: {}
  }

  type UserCashbackConfigGetPayload<S extends boolean | null | undefined | UserCashbackConfigDefaultArgs> = $Result.GetResult<Prisma.$UserCashbackConfigPayload, S>

  type UserCashbackConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserCashbackConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCashbackConfigCountAggregateInputType | true
    }

  export interface UserCashbackConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserCashbackConfig'], meta: { name: 'UserCashbackConfig' } }
    /**
     * Find zero or one UserCashbackConfig that matches the filter.
     * @param {UserCashbackConfigFindUniqueArgs} args - Arguments to find a UserCashbackConfig
     * @example
     * // Get one UserCashbackConfig
     * const userCashbackConfig = await prisma.userCashbackConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserCashbackConfigFindUniqueArgs>(args: SelectSubset<T, UserCashbackConfigFindUniqueArgs<ExtArgs>>): Prisma__UserCashbackConfigClient<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserCashbackConfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserCashbackConfigFindUniqueOrThrowArgs} args - Arguments to find a UserCashbackConfig
     * @example
     * // Get one UserCashbackConfig
     * const userCashbackConfig = await prisma.userCashbackConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserCashbackConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, UserCashbackConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserCashbackConfigClient<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserCashbackConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCashbackConfigFindFirstArgs} args - Arguments to find a UserCashbackConfig
     * @example
     * // Get one UserCashbackConfig
     * const userCashbackConfig = await prisma.userCashbackConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserCashbackConfigFindFirstArgs>(args?: SelectSubset<T, UserCashbackConfigFindFirstArgs<ExtArgs>>): Prisma__UserCashbackConfigClient<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserCashbackConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCashbackConfigFindFirstOrThrowArgs} args - Arguments to find a UserCashbackConfig
     * @example
     * // Get one UserCashbackConfig
     * const userCashbackConfig = await prisma.userCashbackConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserCashbackConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, UserCashbackConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserCashbackConfigClient<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserCashbackConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCashbackConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserCashbackConfigs
     * const userCashbackConfigs = await prisma.userCashbackConfig.findMany()
     * 
     * // Get first 10 UserCashbackConfigs
     * const userCashbackConfigs = await prisma.userCashbackConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userCashbackConfigWithIdOnly = await prisma.userCashbackConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserCashbackConfigFindManyArgs>(args?: SelectSubset<T, UserCashbackConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserCashbackConfig.
     * @param {UserCashbackConfigCreateArgs} args - Arguments to create a UserCashbackConfig.
     * @example
     * // Create one UserCashbackConfig
     * const UserCashbackConfig = await prisma.userCashbackConfig.create({
     *   data: {
     *     // ... data to create a UserCashbackConfig
     *   }
     * })
     * 
     */
    create<T extends UserCashbackConfigCreateArgs>(args: SelectSubset<T, UserCashbackConfigCreateArgs<ExtArgs>>): Prisma__UserCashbackConfigClient<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserCashbackConfigs.
     * @param {UserCashbackConfigCreateManyArgs} args - Arguments to create many UserCashbackConfigs.
     * @example
     * // Create many UserCashbackConfigs
     * const userCashbackConfig = await prisma.userCashbackConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCashbackConfigCreateManyArgs>(args?: SelectSubset<T, UserCashbackConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserCashbackConfigs and returns the data saved in the database.
     * @param {UserCashbackConfigCreateManyAndReturnArgs} args - Arguments to create many UserCashbackConfigs.
     * @example
     * // Create many UserCashbackConfigs
     * const userCashbackConfig = await prisma.userCashbackConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserCashbackConfigs and only return the `id`
     * const userCashbackConfigWithIdOnly = await prisma.userCashbackConfig.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCashbackConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCashbackConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserCashbackConfig.
     * @param {UserCashbackConfigDeleteArgs} args - Arguments to delete one UserCashbackConfig.
     * @example
     * // Delete one UserCashbackConfig
     * const UserCashbackConfig = await prisma.userCashbackConfig.delete({
     *   where: {
     *     // ... filter to delete one UserCashbackConfig
     *   }
     * })
     * 
     */
    delete<T extends UserCashbackConfigDeleteArgs>(args: SelectSubset<T, UserCashbackConfigDeleteArgs<ExtArgs>>): Prisma__UserCashbackConfigClient<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserCashbackConfig.
     * @param {UserCashbackConfigUpdateArgs} args - Arguments to update one UserCashbackConfig.
     * @example
     * // Update one UserCashbackConfig
     * const userCashbackConfig = await prisma.userCashbackConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserCashbackConfigUpdateArgs>(args: SelectSubset<T, UserCashbackConfigUpdateArgs<ExtArgs>>): Prisma__UserCashbackConfigClient<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserCashbackConfigs.
     * @param {UserCashbackConfigDeleteManyArgs} args - Arguments to filter UserCashbackConfigs to delete.
     * @example
     * // Delete a few UserCashbackConfigs
     * const { count } = await prisma.userCashbackConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserCashbackConfigDeleteManyArgs>(args?: SelectSubset<T, UserCashbackConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserCashbackConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCashbackConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserCashbackConfigs
     * const userCashbackConfig = await prisma.userCashbackConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserCashbackConfigUpdateManyArgs>(args: SelectSubset<T, UserCashbackConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserCashbackConfigs and returns the data updated in the database.
     * @param {UserCashbackConfigUpdateManyAndReturnArgs} args - Arguments to update many UserCashbackConfigs.
     * @example
     * // Update many UserCashbackConfigs
     * const userCashbackConfig = await prisma.userCashbackConfig.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserCashbackConfigs and only return the `id`
     * const userCashbackConfigWithIdOnly = await prisma.userCashbackConfig.updateManyAndReturn({
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
    updateManyAndReturn<T extends UserCashbackConfigUpdateManyAndReturnArgs>(args: SelectSubset<T, UserCashbackConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserCashbackConfig.
     * @param {UserCashbackConfigUpsertArgs} args - Arguments to update or create a UserCashbackConfig.
     * @example
     * // Update or create a UserCashbackConfig
     * const userCashbackConfig = await prisma.userCashbackConfig.upsert({
     *   create: {
     *     // ... data to create a UserCashbackConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserCashbackConfig we want to update
     *   }
     * })
     */
    upsert<T extends UserCashbackConfigUpsertArgs>(args: SelectSubset<T, UserCashbackConfigUpsertArgs<ExtArgs>>): Prisma__UserCashbackConfigClient<$Result.GetResult<Prisma.$UserCashbackConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserCashbackConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCashbackConfigCountArgs} args - Arguments to filter UserCashbackConfigs to count.
     * @example
     * // Count the number of UserCashbackConfigs
     * const count = await prisma.userCashbackConfig.count({
     *   where: {
     *     // ... the filter for the UserCashbackConfigs we want to count
     *   }
     * })
    **/
    count<T extends UserCashbackConfigCountArgs>(
      args?: Subset<T, UserCashbackConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCashbackConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserCashbackConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCashbackConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserCashbackConfigAggregateArgs>(args: Subset<T, UserCashbackConfigAggregateArgs>): Prisma.PrismaPromise<GetUserCashbackConfigAggregateType<T>>

    /**
     * Group by UserCashbackConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCashbackConfigGroupByArgs} args - Group by arguments.
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
      T extends UserCashbackConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserCashbackConfigGroupByArgs['orderBy'] }
        : { orderBy?: UserCashbackConfigGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserCashbackConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserCashbackConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserCashbackConfig model
   */
  readonly fields: UserCashbackConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserCashbackConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserCashbackConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the UserCashbackConfig model
   */
  interface UserCashbackConfigFieldRefs {
    readonly id: FieldRef<"UserCashbackConfig", 'String'>
    readonly userId: FieldRef<"UserCashbackConfig", 'String'>
    readonly consumerPercent: FieldRef<"UserCashbackConfig", 'Decimal'>
    readonly clubPercent: FieldRef<"UserCashbackConfig", 'Decimal'>
    readonly consumerReferrerPercent: FieldRef<"UserCashbackConfig", 'Decimal'>
    readonly merchantReferrerPercent: FieldRef<"UserCashbackConfig", 'Decimal'>
    readonly reason: FieldRef<"UserCashbackConfig", 'String'>
    readonly configuredBy: FieldRef<"UserCashbackConfig", 'String'>
    readonly configuredAt: FieldRef<"UserCashbackConfig", 'DateTime'>
    readonly createdAt: FieldRef<"UserCashbackConfig", 'DateTime'>
    readonly updatedAt: FieldRef<"UserCashbackConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserCashbackConfig findUnique
   */
  export type UserCashbackConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter, which UserCashbackConfig to fetch.
     */
    where: UserCashbackConfigWhereUniqueInput
  }

  /**
   * UserCashbackConfig findUniqueOrThrow
   */
  export type UserCashbackConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter, which UserCashbackConfig to fetch.
     */
    where: UserCashbackConfigWhereUniqueInput
  }

  /**
   * UserCashbackConfig findFirst
   */
  export type UserCashbackConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter, which UserCashbackConfig to fetch.
     */
    where?: UserCashbackConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCashbackConfigs to fetch.
     */
    orderBy?: UserCashbackConfigOrderByWithRelationInput | UserCashbackConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserCashbackConfigs.
     */
    cursor?: UserCashbackConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCashbackConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCashbackConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserCashbackConfigs.
     */
    distinct?: UserCashbackConfigScalarFieldEnum | UserCashbackConfigScalarFieldEnum[]
  }

  /**
   * UserCashbackConfig findFirstOrThrow
   */
  export type UserCashbackConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter, which UserCashbackConfig to fetch.
     */
    where?: UserCashbackConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCashbackConfigs to fetch.
     */
    orderBy?: UserCashbackConfigOrderByWithRelationInput | UserCashbackConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserCashbackConfigs.
     */
    cursor?: UserCashbackConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCashbackConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCashbackConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserCashbackConfigs.
     */
    distinct?: UserCashbackConfigScalarFieldEnum | UserCashbackConfigScalarFieldEnum[]
  }

  /**
   * UserCashbackConfig findMany
   */
  export type UserCashbackConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter, which UserCashbackConfigs to fetch.
     */
    where?: UserCashbackConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCashbackConfigs to fetch.
     */
    orderBy?: UserCashbackConfigOrderByWithRelationInput | UserCashbackConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserCashbackConfigs.
     */
    cursor?: UserCashbackConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCashbackConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCashbackConfigs.
     */
    skip?: number
    distinct?: UserCashbackConfigScalarFieldEnum | UserCashbackConfigScalarFieldEnum[]
  }

  /**
   * UserCashbackConfig create
   */
  export type UserCashbackConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigInclude<ExtArgs> | null
    /**
     * The data needed to create a UserCashbackConfig.
     */
    data: XOR<UserCashbackConfigCreateInput, UserCashbackConfigUncheckedCreateInput>
  }

  /**
   * UserCashbackConfig createMany
   */
  export type UserCashbackConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserCashbackConfigs.
     */
    data: UserCashbackConfigCreateManyInput | UserCashbackConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserCashbackConfig createManyAndReturn
   */
  export type UserCashbackConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * The data used to create many UserCashbackConfigs.
     */
    data: UserCashbackConfigCreateManyInput | UserCashbackConfigCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserCashbackConfig update
   */
  export type UserCashbackConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigInclude<ExtArgs> | null
    /**
     * The data needed to update a UserCashbackConfig.
     */
    data: XOR<UserCashbackConfigUpdateInput, UserCashbackConfigUncheckedUpdateInput>
    /**
     * Choose, which UserCashbackConfig to update.
     */
    where: UserCashbackConfigWhereUniqueInput
  }

  /**
   * UserCashbackConfig updateMany
   */
  export type UserCashbackConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserCashbackConfigs.
     */
    data: XOR<UserCashbackConfigUpdateManyMutationInput, UserCashbackConfigUncheckedUpdateManyInput>
    /**
     * Filter which UserCashbackConfigs to update
     */
    where?: UserCashbackConfigWhereInput
    /**
     * Limit how many UserCashbackConfigs to update.
     */
    limit?: number
  }

  /**
   * UserCashbackConfig updateManyAndReturn
   */
  export type UserCashbackConfigUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * The data used to update UserCashbackConfigs.
     */
    data: XOR<UserCashbackConfigUpdateManyMutationInput, UserCashbackConfigUncheckedUpdateManyInput>
    /**
     * Filter which UserCashbackConfigs to update
     */
    where?: UserCashbackConfigWhereInput
    /**
     * Limit how many UserCashbackConfigs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserCashbackConfig upsert
   */
  export type UserCashbackConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigInclude<ExtArgs> | null
    /**
     * The filter to search for the UserCashbackConfig to update in case it exists.
     */
    where: UserCashbackConfigWhereUniqueInput
    /**
     * In case the UserCashbackConfig found by the `where` argument doesn't exist, create a new UserCashbackConfig with this data.
     */
    create: XOR<UserCashbackConfigCreateInput, UserCashbackConfigUncheckedCreateInput>
    /**
     * In case the UserCashbackConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserCashbackConfigUpdateInput, UserCashbackConfigUncheckedUpdateInput>
  }

  /**
   * UserCashbackConfig delete
   */
  export type UserCashbackConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigInclude<ExtArgs> | null
    /**
     * Filter which UserCashbackConfig to delete.
     */
    where: UserCashbackConfigWhereUniqueInput
  }

  /**
   * UserCashbackConfig deleteMany
   */
  export type UserCashbackConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserCashbackConfigs to delete
     */
    where?: UserCashbackConfigWhereInput
    /**
     * Limit how many UserCashbackConfigs to delete.
     */
    limit?: number
  }

  /**
   * UserCashbackConfig without action
   */
  export type UserCashbackConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCashbackConfig
     */
    select?: UserCashbackConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCashbackConfig
     */
    omit?: UserCashbackConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCashbackConfigInclude<ExtArgs> | null
  }


  /**
   * Model UserPushToken
   */

  export type AggregateUserPushToken = {
    _count: UserPushTokenCountAggregateOutputType | null
    _min: UserPushTokenMinAggregateOutputType | null
    _max: UserPushTokenMaxAggregateOutputType | null
  }

  export type UserPushTokenMinAggregateOutputType = {
    id: string | null
    userId: string | null
    token: string | null
    platform: $Enums.Platform | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserPushTokenMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    token: string | null
    platform: $Enums.Platform | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserPushTokenCountAggregateOutputType = {
    id: number
    userId: number
    token: number
    platform: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserPushTokenMinAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    platform?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserPushTokenMaxAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    platform?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserPushTokenCountAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    platform?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserPushTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserPushToken to aggregate.
     */
    where?: UserPushTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPushTokens to fetch.
     */
    orderBy?: UserPushTokenOrderByWithRelationInput | UserPushTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserPushTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPushTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPushTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserPushTokens
    **/
    _count?: true | UserPushTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserPushTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserPushTokenMaxAggregateInputType
  }

  export type GetUserPushTokenAggregateType<T extends UserPushTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateUserPushToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserPushToken[P]>
      : GetScalarType<T[P], AggregateUserPushToken[P]>
  }




  export type UserPushTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserPushTokenWhereInput
    orderBy?: UserPushTokenOrderByWithAggregationInput | UserPushTokenOrderByWithAggregationInput[]
    by: UserPushTokenScalarFieldEnum[] | UserPushTokenScalarFieldEnum
    having?: UserPushTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserPushTokenCountAggregateInputType | true
    _min?: UserPushTokenMinAggregateInputType
    _max?: UserPushTokenMaxAggregateInputType
  }

  export type UserPushTokenGroupByOutputType = {
    id: string
    userId: string
    token: string
    platform: $Enums.Platform
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: UserPushTokenCountAggregateOutputType | null
    _min: UserPushTokenMinAggregateOutputType | null
    _max: UserPushTokenMaxAggregateOutputType | null
  }

  type GetUserPushTokenGroupByPayload<T extends UserPushTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserPushTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserPushTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserPushTokenGroupByOutputType[P]>
            : GetScalarType<T[P], UserPushTokenGroupByOutputType[P]>
        }
      >
    >


  export type UserPushTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    platform?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPushToken"]>

  export type UserPushTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    platform?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPushToken"]>

  export type UserPushTokenSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    platform?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPushToken"]>

  export type UserPushTokenSelectScalar = {
    id?: boolean
    userId?: boolean
    token?: boolean
    platform?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserPushTokenOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "token" | "platform" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["userPushToken"]>
  export type UserPushTokenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserPushTokenIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserPushTokenIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserPushTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserPushToken"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      token: string
      platform: $Enums.Platform
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userPushToken"]>
    composites: {}
  }

  type UserPushTokenGetPayload<S extends boolean | null | undefined | UserPushTokenDefaultArgs> = $Result.GetResult<Prisma.$UserPushTokenPayload, S>

  type UserPushTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserPushTokenFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserPushTokenCountAggregateInputType | true
    }

  export interface UserPushTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserPushToken'], meta: { name: 'UserPushToken' } }
    /**
     * Find zero or one UserPushToken that matches the filter.
     * @param {UserPushTokenFindUniqueArgs} args - Arguments to find a UserPushToken
     * @example
     * // Get one UserPushToken
     * const userPushToken = await prisma.userPushToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserPushTokenFindUniqueArgs>(args: SelectSubset<T, UserPushTokenFindUniqueArgs<ExtArgs>>): Prisma__UserPushTokenClient<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserPushToken that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserPushTokenFindUniqueOrThrowArgs} args - Arguments to find a UserPushToken
     * @example
     * // Get one UserPushToken
     * const userPushToken = await prisma.userPushToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserPushTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, UserPushTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserPushTokenClient<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserPushToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPushTokenFindFirstArgs} args - Arguments to find a UserPushToken
     * @example
     * // Get one UserPushToken
     * const userPushToken = await prisma.userPushToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserPushTokenFindFirstArgs>(args?: SelectSubset<T, UserPushTokenFindFirstArgs<ExtArgs>>): Prisma__UserPushTokenClient<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserPushToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPushTokenFindFirstOrThrowArgs} args - Arguments to find a UserPushToken
     * @example
     * // Get one UserPushToken
     * const userPushToken = await prisma.userPushToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserPushTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, UserPushTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserPushTokenClient<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserPushTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPushTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserPushTokens
     * const userPushTokens = await prisma.userPushToken.findMany()
     * 
     * // Get first 10 UserPushTokens
     * const userPushTokens = await prisma.userPushToken.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userPushTokenWithIdOnly = await prisma.userPushToken.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserPushTokenFindManyArgs>(args?: SelectSubset<T, UserPushTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserPushToken.
     * @param {UserPushTokenCreateArgs} args - Arguments to create a UserPushToken.
     * @example
     * // Create one UserPushToken
     * const UserPushToken = await prisma.userPushToken.create({
     *   data: {
     *     // ... data to create a UserPushToken
     *   }
     * })
     * 
     */
    create<T extends UserPushTokenCreateArgs>(args: SelectSubset<T, UserPushTokenCreateArgs<ExtArgs>>): Prisma__UserPushTokenClient<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserPushTokens.
     * @param {UserPushTokenCreateManyArgs} args - Arguments to create many UserPushTokens.
     * @example
     * // Create many UserPushTokens
     * const userPushToken = await prisma.userPushToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserPushTokenCreateManyArgs>(args?: SelectSubset<T, UserPushTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserPushTokens and returns the data saved in the database.
     * @param {UserPushTokenCreateManyAndReturnArgs} args - Arguments to create many UserPushTokens.
     * @example
     * // Create many UserPushTokens
     * const userPushToken = await prisma.userPushToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserPushTokens and only return the `id`
     * const userPushTokenWithIdOnly = await prisma.userPushToken.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserPushTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, UserPushTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserPushToken.
     * @param {UserPushTokenDeleteArgs} args - Arguments to delete one UserPushToken.
     * @example
     * // Delete one UserPushToken
     * const UserPushToken = await prisma.userPushToken.delete({
     *   where: {
     *     // ... filter to delete one UserPushToken
     *   }
     * })
     * 
     */
    delete<T extends UserPushTokenDeleteArgs>(args: SelectSubset<T, UserPushTokenDeleteArgs<ExtArgs>>): Prisma__UserPushTokenClient<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserPushToken.
     * @param {UserPushTokenUpdateArgs} args - Arguments to update one UserPushToken.
     * @example
     * // Update one UserPushToken
     * const userPushToken = await prisma.userPushToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserPushTokenUpdateArgs>(args: SelectSubset<T, UserPushTokenUpdateArgs<ExtArgs>>): Prisma__UserPushTokenClient<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserPushTokens.
     * @param {UserPushTokenDeleteManyArgs} args - Arguments to filter UserPushTokens to delete.
     * @example
     * // Delete a few UserPushTokens
     * const { count } = await prisma.userPushToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserPushTokenDeleteManyArgs>(args?: SelectSubset<T, UserPushTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserPushTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPushTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserPushTokens
     * const userPushToken = await prisma.userPushToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserPushTokenUpdateManyArgs>(args: SelectSubset<T, UserPushTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserPushTokens and returns the data updated in the database.
     * @param {UserPushTokenUpdateManyAndReturnArgs} args - Arguments to update many UserPushTokens.
     * @example
     * // Update many UserPushTokens
     * const userPushToken = await prisma.userPushToken.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserPushTokens and only return the `id`
     * const userPushTokenWithIdOnly = await prisma.userPushToken.updateManyAndReturn({
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
    updateManyAndReturn<T extends UserPushTokenUpdateManyAndReturnArgs>(args: SelectSubset<T, UserPushTokenUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserPushToken.
     * @param {UserPushTokenUpsertArgs} args - Arguments to update or create a UserPushToken.
     * @example
     * // Update or create a UserPushToken
     * const userPushToken = await prisma.userPushToken.upsert({
     *   create: {
     *     // ... data to create a UserPushToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserPushToken we want to update
     *   }
     * })
     */
    upsert<T extends UserPushTokenUpsertArgs>(args: SelectSubset<T, UserPushTokenUpsertArgs<ExtArgs>>): Prisma__UserPushTokenClient<$Result.GetResult<Prisma.$UserPushTokenPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserPushTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPushTokenCountArgs} args - Arguments to filter UserPushTokens to count.
     * @example
     * // Count the number of UserPushTokens
     * const count = await prisma.userPushToken.count({
     *   where: {
     *     // ... the filter for the UserPushTokens we want to count
     *   }
     * })
    **/
    count<T extends UserPushTokenCountArgs>(
      args?: Subset<T, UserPushTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserPushTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserPushToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPushTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserPushTokenAggregateArgs>(args: Subset<T, UserPushTokenAggregateArgs>): Prisma.PrismaPromise<GetUserPushTokenAggregateType<T>>

    /**
     * Group by UserPushToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPushTokenGroupByArgs} args - Group by arguments.
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
      T extends UserPushTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserPushTokenGroupByArgs['orderBy'] }
        : { orderBy?: UserPushTokenGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserPushTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserPushTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserPushToken model
   */
  readonly fields: UserPushTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserPushToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserPushTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the UserPushToken model
   */
  interface UserPushTokenFieldRefs {
    readonly id: FieldRef<"UserPushToken", 'String'>
    readonly userId: FieldRef<"UserPushToken", 'String'>
    readonly token: FieldRef<"UserPushToken", 'String'>
    readonly platform: FieldRef<"UserPushToken", 'Platform'>
    readonly isActive: FieldRef<"UserPushToken", 'Boolean'>
    readonly createdAt: FieldRef<"UserPushToken", 'DateTime'>
    readonly updatedAt: FieldRef<"UserPushToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserPushToken findUnique
   */
  export type UserPushTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenInclude<ExtArgs> | null
    /**
     * Filter, which UserPushToken to fetch.
     */
    where: UserPushTokenWhereUniqueInput
  }

  /**
   * UserPushToken findUniqueOrThrow
   */
  export type UserPushTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenInclude<ExtArgs> | null
    /**
     * Filter, which UserPushToken to fetch.
     */
    where: UserPushTokenWhereUniqueInput
  }

  /**
   * UserPushToken findFirst
   */
  export type UserPushTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenInclude<ExtArgs> | null
    /**
     * Filter, which UserPushToken to fetch.
     */
    where?: UserPushTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPushTokens to fetch.
     */
    orderBy?: UserPushTokenOrderByWithRelationInput | UserPushTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserPushTokens.
     */
    cursor?: UserPushTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPushTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPushTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserPushTokens.
     */
    distinct?: UserPushTokenScalarFieldEnum | UserPushTokenScalarFieldEnum[]
  }

  /**
   * UserPushToken findFirstOrThrow
   */
  export type UserPushTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenInclude<ExtArgs> | null
    /**
     * Filter, which UserPushToken to fetch.
     */
    where?: UserPushTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPushTokens to fetch.
     */
    orderBy?: UserPushTokenOrderByWithRelationInput | UserPushTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserPushTokens.
     */
    cursor?: UserPushTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPushTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPushTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserPushTokens.
     */
    distinct?: UserPushTokenScalarFieldEnum | UserPushTokenScalarFieldEnum[]
  }

  /**
   * UserPushToken findMany
   */
  export type UserPushTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenInclude<ExtArgs> | null
    /**
     * Filter, which UserPushTokens to fetch.
     */
    where?: UserPushTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPushTokens to fetch.
     */
    orderBy?: UserPushTokenOrderByWithRelationInput | UserPushTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserPushTokens.
     */
    cursor?: UserPushTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPushTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPushTokens.
     */
    skip?: number
    distinct?: UserPushTokenScalarFieldEnum | UserPushTokenScalarFieldEnum[]
  }

  /**
   * UserPushToken create
   */
  export type UserPushTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenInclude<ExtArgs> | null
    /**
     * The data needed to create a UserPushToken.
     */
    data: XOR<UserPushTokenCreateInput, UserPushTokenUncheckedCreateInput>
  }

  /**
   * UserPushToken createMany
   */
  export type UserPushTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserPushTokens.
     */
    data: UserPushTokenCreateManyInput | UserPushTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserPushToken createManyAndReturn
   */
  export type UserPushTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * The data used to create many UserPushTokens.
     */
    data: UserPushTokenCreateManyInput | UserPushTokenCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserPushToken update
   */
  export type UserPushTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenInclude<ExtArgs> | null
    /**
     * The data needed to update a UserPushToken.
     */
    data: XOR<UserPushTokenUpdateInput, UserPushTokenUncheckedUpdateInput>
    /**
     * Choose, which UserPushToken to update.
     */
    where: UserPushTokenWhereUniqueInput
  }

  /**
   * UserPushToken updateMany
   */
  export type UserPushTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserPushTokens.
     */
    data: XOR<UserPushTokenUpdateManyMutationInput, UserPushTokenUncheckedUpdateManyInput>
    /**
     * Filter which UserPushTokens to update
     */
    where?: UserPushTokenWhereInput
    /**
     * Limit how many UserPushTokens to update.
     */
    limit?: number
  }

  /**
   * UserPushToken updateManyAndReturn
   */
  export type UserPushTokenUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * The data used to update UserPushTokens.
     */
    data: XOR<UserPushTokenUpdateManyMutationInput, UserPushTokenUncheckedUpdateManyInput>
    /**
     * Filter which UserPushTokens to update
     */
    where?: UserPushTokenWhereInput
    /**
     * Limit how many UserPushTokens to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserPushToken upsert
   */
  export type UserPushTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenInclude<ExtArgs> | null
    /**
     * The filter to search for the UserPushToken to update in case it exists.
     */
    where: UserPushTokenWhereUniqueInput
    /**
     * In case the UserPushToken found by the `where` argument doesn't exist, create a new UserPushToken with this data.
     */
    create: XOR<UserPushTokenCreateInput, UserPushTokenUncheckedCreateInput>
    /**
     * In case the UserPushToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserPushTokenUpdateInput, UserPushTokenUncheckedUpdateInput>
  }

  /**
   * UserPushToken delete
   */
  export type UserPushTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenInclude<ExtArgs> | null
    /**
     * Filter which UserPushToken to delete.
     */
    where: UserPushTokenWhereUniqueInput
  }

  /**
   * UserPushToken deleteMany
   */
  export type UserPushTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserPushTokens to delete
     */
    where?: UserPushTokenWhereInput
    /**
     * Limit how many UserPushTokens to delete.
     */
    limit?: number
  }

  /**
   * UserPushToken without action
   */
  export type UserPushTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPushToken
     */
    select?: UserPushTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPushToken
     */
    omit?: UserPushTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPushTokenInclude<ExtArgs> | null
  }


  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    price: Decimal | null
    cashbackPercentage: Decimal | null
    stock: number | null
  }

  export type ProductSumAggregateOutputType = {
    price: Decimal | null
    cashbackPercentage: Decimal | null
    stock: number | null
  }

  export type ProductMinAggregateOutputType = {
    id: string | null
    merchantId: string | null
    name: string | null
    description: string | null
    price: Decimal | null
    cashbackPercentage: Decimal | null
    imageUrl: string | null
    category: string | null
    stock: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductMaxAggregateOutputType = {
    id: string | null
    merchantId: string | null
    name: string | null
    description: string | null
    price: Decimal | null
    cashbackPercentage: Decimal | null
    imageUrl: string | null
    category: string | null
    stock: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    merchantId: number
    name: number
    description: number
    price: number
    cashbackPercentage: number
    imageUrl: number
    category: number
    stock: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    price?: true
    cashbackPercentage?: true
    stock?: true
  }

  export type ProductSumAggregateInputType = {
    price?: true
    cashbackPercentage?: true
    stock?: true
  }

  export type ProductMinAggregateInputType = {
    id?: true
    merchantId?: true
    name?: true
    description?: true
    price?: true
    cashbackPercentage?: true
    imageUrl?: true
    category?: true
    stock?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    merchantId?: true
    name?: true
    description?: true
    price?: true
    cashbackPercentage?: true
    imageUrl?: true
    category?: true
    stock?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    merchantId?: true
    name?: true
    description?: true
    price?: true
    cashbackPercentage?: true
    imageUrl?: true
    category?: true
    stock?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: string
    merchantId: string
    name: string
    description: string
    price: Decimal
    cashbackPercentage: Decimal
    imageUrl: string | null
    category: string | null
    stock: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    merchantId?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    cashbackPercentage?: boolean
    imageUrl?: boolean
    category?: boolean
    stock?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    merchant?: boolean | UserDefaultArgs<ExtArgs>
    purchases?: boolean | Product$purchasesArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    merchantId?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    cashbackPercentage?: boolean
    imageUrl?: boolean
    category?: boolean
    stock?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    merchant?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    merchantId?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    cashbackPercentage?: boolean
    imageUrl?: boolean
    category?: boolean
    stock?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    merchant?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
    id?: boolean
    merchantId?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    cashbackPercentage?: boolean
    imageUrl?: boolean
    category?: boolean
    stock?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "merchantId" | "name" | "description" | "price" | "cashbackPercentage" | "imageUrl" | "category" | "stock" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["product"]>
  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    merchant?: boolean | UserDefaultArgs<ExtArgs>
    purchases?: boolean | Product$purchasesArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    merchant?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ProductIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    merchant?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      merchant: Prisma.$UserPayload<ExtArgs>
      purchases: Prisma.$PurchasePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      merchantId: string
      name: string
      description: string
      price: Prisma.Decimal
      cashbackPercentage: Prisma.Decimal
      imageUrl: string | null
      category: string | null
      stock: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productWithIdOnly = await prisma.product.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products and returns the data updated in the database.
     * @param {ProductUpdateManyAndReturnArgs} args - Arguments to update many Products.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Products and only return the `id`
     * const productWithIdOnly = await prisma.product.updateManyAndReturn({
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
    updateManyAndReturn<T extends ProductUpdateManyAndReturnArgs>(args: SelectSubset<T, ProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
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
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    merchant<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    purchases<T extends Product$purchasesArgs<ExtArgs> = {}>(args?: Subset<T, Product$purchasesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Product model
   */
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'String'>
    readonly merchantId: FieldRef<"Product", 'String'>
    readonly name: FieldRef<"Product", 'String'>
    readonly description: FieldRef<"Product", 'String'>
    readonly price: FieldRef<"Product", 'Decimal'>
    readonly cashbackPercentage: FieldRef<"Product", 'Decimal'>
    readonly imageUrl: FieldRef<"Product", 'String'>
    readonly category: FieldRef<"Product", 'String'>
    readonly stock: FieldRef<"Product", 'Int'>
    readonly isActive: FieldRef<"Product", 'Boolean'>
    readonly createdAt: FieldRef<"Product", 'DateTime'>
    readonly updatedAt: FieldRef<"Product", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product updateManyAndReturn
   */
  export type ProductUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to delete.
     */
    limit?: number
  }

  /**
   * Product.purchases
   */
  export type Product$purchasesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    where?: PurchaseWhereInput
    orderBy?: PurchaseOrderByWithRelationInput | PurchaseOrderByWithRelationInput[]
    cursor?: PurchaseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PurchaseScalarFieldEnum | PurchaseScalarFieldEnum[]
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model Purchase
   */

  export type AggregatePurchase = {
    _count: PurchaseCountAggregateOutputType | null
    _avg: PurchaseAvgAggregateOutputType | null
    _sum: PurchaseSumAggregateOutputType | null
    _min: PurchaseMinAggregateOutputType | null
    _max: PurchaseMaxAggregateOutputType | null
  }

  export type PurchaseAvgAggregateOutputType = {
    totalAmount: Decimal | null
    merchantAmount: Decimal | null
    consumerCashback: Decimal | null
    platformFee: Decimal | null
    consumerReferrerFee: Decimal | null
    merchantReferrerFee: Decimal | null
  }

  export type PurchaseSumAggregateOutputType = {
    totalAmount: Decimal | null
    merchantAmount: Decimal | null
    consumerCashback: Decimal | null
    platformFee: Decimal | null
    consumerReferrerFee: Decimal | null
    merchantReferrerFee: Decimal | null
  }

  export type PurchaseMinAggregateOutputType = {
    id: string | null
    consumerId: string | null
    merchantId: string | null
    productId: string | null
    totalAmount: Decimal | null
    merchantAmount: Decimal | null
    consumerCashback: Decimal | null
    platformFee: Decimal | null
    consumerReferrerFee: Decimal | null
    merchantReferrerFee: Decimal | null
    status: $Enums.PurchaseStatus | null
    txHash: string | null
    createdAt: Date | null
    completedAt: Date | null
  }

  export type PurchaseMaxAggregateOutputType = {
    id: string | null
    consumerId: string | null
    merchantId: string | null
    productId: string | null
    totalAmount: Decimal | null
    merchantAmount: Decimal | null
    consumerCashback: Decimal | null
    platformFee: Decimal | null
    consumerReferrerFee: Decimal | null
    merchantReferrerFee: Decimal | null
    status: $Enums.PurchaseStatus | null
    txHash: string | null
    createdAt: Date | null
    completedAt: Date | null
  }

  export type PurchaseCountAggregateOutputType = {
    id: number
    consumerId: number
    merchantId: number
    productId: number
    totalAmount: number
    merchantAmount: number
    consumerCashback: number
    platformFee: number
    consumerReferrerFee: number
    merchantReferrerFee: number
    status: number
    txHash: number
    createdAt: number
    completedAt: number
    _all: number
  }


  export type PurchaseAvgAggregateInputType = {
    totalAmount?: true
    merchantAmount?: true
    consumerCashback?: true
    platformFee?: true
    consumerReferrerFee?: true
    merchantReferrerFee?: true
  }

  export type PurchaseSumAggregateInputType = {
    totalAmount?: true
    merchantAmount?: true
    consumerCashback?: true
    platformFee?: true
    consumerReferrerFee?: true
    merchantReferrerFee?: true
  }

  export type PurchaseMinAggregateInputType = {
    id?: true
    consumerId?: true
    merchantId?: true
    productId?: true
    totalAmount?: true
    merchantAmount?: true
    consumerCashback?: true
    platformFee?: true
    consumerReferrerFee?: true
    merchantReferrerFee?: true
    status?: true
    txHash?: true
    createdAt?: true
    completedAt?: true
  }

  export type PurchaseMaxAggregateInputType = {
    id?: true
    consumerId?: true
    merchantId?: true
    productId?: true
    totalAmount?: true
    merchantAmount?: true
    consumerCashback?: true
    platformFee?: true
    consumerReferrerFee?: true
    merchantReferrerFee?: true
    status?: true
    txHash?: true
    createdAt?: true
    completedAt?: true
  }

  export type PurchaseCountAggregateInputType = {
    id?: true
    consumerId?: true
    merchantId?: true
    productId?: true
    totalAmount?: true
    merchantAmount?: true
    consumerCashback?: true
    platformFee?: true
    consumerReferrerFee?: true
    merchantReferrerFee?: true
    status?: true
    txHash?: true
    createdAt?: true
    completedAt?: true
    _all?: true
  }

  export type PurchaseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Purchase to aggregate.
     */
    where?: PurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Purchases to fetch.
     */
    orderBy?: PurchaseOrderByWithRelationInput | PurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Purchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Purchases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Purchases
    **/
    _count?: true | PurchaseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PurchaseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PurchaseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PurchaseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PurchaseMaxAggregateInputType
  }

  export type GetPurchaseAggregateType<T extends PurchaseAggregateArgs> = {
        [P in keyof T & keyof AggregatePurchase]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePurchase[P]>
      : GetScalarType<T[P], AggregatePurchase[P]>
  }




  export type PurchaseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseWhereInput
    orderBy?: PurchaseOrderByWithAggregationInput | PurchaseOrderByWithAggregationInput[]
    by: PurchaseScalarFieldEnum[] | PurchaseScalarFieldEnum
    having?: PurchaseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PurchaseCountAggregateInputType | true
    _avg?: PurchaseAvgAggregateInputType
    _sum?: PurchaseSumAggregateInputType
    _min?: PurchaseMinAggregateInputType
    _max?: PurchaseMaxAggregateInputType
  }

  export type PurchaseGroupByOutputType = {
    id: string
    consumerId: string
    merchantId: string
    productId: string
    totalAmount: Decimal
    merchantAmount: Decimal
    consumerCashback: Decimal
    platformFee: Decimal
    consumerReferrerFee: Decimal
    merchantReferrerFee: Decimal
    status: $Enums.PurchaseStatus
    txHash: string | null
    createdAt: Date
    completedAt: Date | null
    _count: PurchaseCountAggregateOutputType | null
    _avg: PurchaseAvgAggregateOutputType | null
    _sum: PurchaseSumAggregateOutputType | null
    _min: PurchaseMinAggregateOutputType | null
    _max: PurchaseMaxAggregateOutputType | null
  }

  type GetPurchaseGroupByPayload<T extends PurchaseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PurchaseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PurchaseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PurchaseGroupByOutputType[P]>
            : GetScalarType<T[P], PurchaseGroupByOutputType[P]>
        }
      >
    >


  export type PurchaseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    consumerId?: boolean
    merchantId?: boolean
    productId?: boolean
    totalAmount?: boolean
    merchantAmount?: boolean
    consumerCashback?: boolean
    platformFee?: boolean
    consumerReferrerFee?: boolean
    merchantReferrerFee?: boolean
    status?: boolean
    txHash?: boolean
    createdAt?: boolean
    completedAt?: boolean
    consumer?: boolean | UserDefaultArgs<ExtArgs>
    merchant?: boolean | UserDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["purchase"]>

  export type PurchaseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    consumerId?: boolean
    merchantId?: boolean
    productId?: boolean
    totalAmount?: boolean
    merchantAmount?: boolean
    consumerCashback?: boolean
    platformFee?: boolean
    consumerReferrerFee?: boolean
    merchantReferrerFee?: boolean
    status?: boolean
    txHash?: boolean
    createdAt?: boolean
    completedAt?: boolean
    consumer?: boolean | UserDefaultArgs<ExtArgs>
    merchant?: boolean | UserDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["purchase"]>

  export type PurchaseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    consumerId?: boolean
    merchantId?: boolean
    productId?: boolean
    totalAmount?: boolean
    merchantAmount?: boolean
    consumerCashback?: boolean
    platformFee?: boolean
    consumerReferrerFee?: boolean
    merchantReferrerFee?: boolean
    status?: boolean
    txHash?: boolean
    createdAt?: boolean
    completedAt?: boolean
    consumer?: boolean | UserDefaultArgs<ExtArgs>
    merchant?: boolean | UserDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["purchase"]>

  export type PurchaseSelectScalar = {
    id?: boolean
    consumerId?: boolean
    merchantId?: boolean
    productId?: boolean
    totalAmount?: boolean
    merchantAmount?: boolean
    consumerCashback?: boolean
    platformFee?: boolean
    consumerReferrerFee?: boolean
    merchantReferrerFee?: boolean
    status?: boolean
    txHash?: boolean
    createdAt?: boolean
    completedAt?: boolean
  }

  export type PurchaseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "consumerId" | "merchantId" | "productId" | "totalAmount" | "merchantAmount" | "consumerCashback" | "platformFee" | "consumerReferrerFee" | "merchantReferrerFee" | "status" | "txHash" | "createdAt" | "completedAt", ExtArgs["result"]["purchase"]>
  export type PurchaseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    consumer?: boolean | UserDefaultArgs<ExtArgs>
    merchant?: boolean | UserDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type PurchaseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    consumer?: boolean | UserDefaultArgs<ExtArgs>
    merchant?: boolean | UserDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type PurchaseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    consumer?: boolean | UserDefaultArgs<ExtArgs>
    merchant?: boolean | UserDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $PurchasePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Purchase"
    objects: {
      consumer: Prisma.$UserPayload<ExtArgs>
      merchant: Prisma.$UserPayload<ExtArgs>
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      consumerId: string
      merchantId: string
      productId: string
      totalAmount: Prisma.Decimal
      merchantAmount: Prisma.Decimal
      consumerCashback: Prisma.Decimal
      platformFee: Prisma.Decimal
      consumerReferrerFee: Prisma.Decimal
      merchantReferrerFee: Prisma.Decimal
      status: $Enums.PurchaseStatus
      txHash: string | null
      createdAt: Date
      completedAt: Date | null
    }, ExtArgs["result"]["purchase"]>
    composites: {}
  }

  type PurchaseGetPayload<S extends boolean | null | undefined | PurchaseDefaultArgs> = $Result.GetResult<Prisma.$PurchasePayload, S>

  type PurchaseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PurchaseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PurchaseCountAggregateInputType | true
    }

  export interface PurchaseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Purchase'], meta: { name: 'Purchase' } }
    /**
     * Find zero or one Purchase that matches the filter.
     * @param {PurchaseFindUniqueArgs} args - Arguments to find a Purchase
     * @example
     * // Get one Purchase
     * const purchase = await prisma.purchase.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PurchaseFindUniqueArgs>(args: SelectSubset<T, PurchaseFindUniqueArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Purchase that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PurchaseFindUniqueOrThrowArgs} args - Arguments to find a Purchase
     * @example
     * // Get one Purchase
     * const purchase = await prisma.purchase.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PurchaseFindUniqueOrThrowArgs>(args: SelectSubset<T, PurchaseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Purchase that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseFindFirstArgs} args - Arguments to find a Purchase
     * @example
     * // Get one Purchase
     * const purchase = await prisma.purchase.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PurchaseFindFirstArgs>(args?: SelectSubset<T, PurchaseFindFirstArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Purchase that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseFindFirstOrThrowArgs} args - Arguments to find a Purchase
     * @example
     * // Get one Purchase
     * const purchase = await prisma.purchase.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PurchaseFindFirstOrThrowArgs>(args?: SelectSubset<T, PurchaseFindFirstOrThrowArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Purchases that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Purchases
     * const purchases = await prisma.purchase.findMany()
     * 
     * // Get first 10 Purchases
     * const purchases = await prisma.purchase.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const purchaseWithIdOnly = await prisma.purchase.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PurchaseFindManyArgs>(args?: SelectSubset<T, PurchaseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Purchase.
     * @param {PurchaseCreateArgs} args - Arguments to create a Purchase.
     * @example
     * // Create one Purchase
     * const Purchase = await prisma.purchase.create({
     *   data: {
     *     // ... data to create a Purchase
     *   }
     * })
     * 
     */
    create<T extends PurchaseCreateArgs>(args: SelectSubset<T, PurchaseCreateArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Purchases.
     * @param {PurchaseCreateManyArgs} args - Arguments to create many Purchases.
     * @example
     * // Create many Purchases
     * const purchase = await prisma.purchase.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PurchaseCreateManyArgs>(args?: SelectSubset<T, PurchaseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Purchases and returns the data saved in the database.
     * @param {PurchaseCreateManyAndReturnArgs} args - Arguments to create many Purchases.
     * @example
     * // Create many Purchases
     * const purchase = await prisma.purchase.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Purchases and only return the `id`
     * const purchaseWithIdOnly = await prisma.purchase.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PurchaseCreateManyAndReturnArgs>(args?: SelectSubset<T, PurchaseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Purchase.
     * @param {PurchaseDeleteArgs} args - Arguments to delete one Purchase.
     * @example
     * // Delete one Purchase
     * const Purchase = await prisma.purchase.delete({
     *   where: {
     *     // ... filter to delete one Purchase
     *   }
     * })
     * 
     */
    delete<T extends PurchaseDeleteArgs>(args: SelectSubset<T, PurchaseDeleteArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Purchase.
     * @param {PurchaseUpdateArgs} args - Arguments to update one Purchase.
     * @example
     * // Update one Purchase
     * const purchase = await prisma.purchase.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PurchaseUpdateArgs>(args: SelectSubset<T, PurchaseUpdateArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Purchases.
     * @param {PurchaseDeleteManyArgs} args - Arguments to filter Purchases to delete.
     * @example
     * // Delete a few Purchases
     * const { count } = await prisma.purchase.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PurchaseDeleteManyArgs>(args?: SelectSubset<T, PurchaseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Purchases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Purchases
     * const purchase = await prisma.purchase.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PurchaseUpdateManyArgs>(args: SelectSubset<T, PurchaseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Purchases and returns the data updated in the database.
     * @param {PurchaseUpdateManyAndReturnArgs} args - Arguments to update many Purchases.
     * @example
     * // Update many Purchases
     * const purchase = await prisma.purchase.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Purchases and only return the `id`
     * const purchaseWithIdOnly = await prisma.purchase.updateManyAndReturn({
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
    updateManyAndReturn<T extends PurchaseUpdateManyAndReturnArgs>(args: SelectSubset<T, PurchaseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Purchase.
     * @param {PurchaseUpsertArgs} args - Arguments to update or create a Purchase.
     * @example
     * // Update or create a Purchase
     * const purchase = await prisma.purchase.upsert({
     *   create: {
     *     // ... data to create a Purchase
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Purchase we want to update
     *   }
     * })
     */
    upsert<T extends PurchaseUpsertArgs>(args: SelectSubset<T, PurchaseUpsertArgs<ExtArgs>>): Prisma__PurchaseClient<$Result.GetResult<Prisma.$PurchasePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Purchases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseCountArgs} args - Arguments to filter Purchases to count.
     * @example
     * // Count the number of Purchases
     * const count = await prisma.purchase.count({
     *   where: {
     *     // ... the filter for the Purchases we want to count
     *   }
     * })
    **/
    count<T extends PurchaseCountArgs>(
      args?: Subset<T, PurchaseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PurchaseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Purchase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PurchaseAggregateArgs>(args: Subset<T, PurchaseAggregateArgs>): Prisma.PrismaPromise<GetPurchaseAggregateType<T>>

    /**
     * Group by Purchase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseGroupByArgs} args - Group by arguments.
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
      T extends PurchaseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PurchaseGroupByArgs['orderBy'] }
        : { orderBy?: PurchaseGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PurchaseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPurchaseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Purchase model
   */
  readonly fields: PurchaseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Purchase.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PurchaseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    consumer<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    merchant<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Purchase model
   */
  interface PurchaseFieldRefs {
    readonly id: FieldRef<"Purchase", 'String'>
    readonly consumerId: FieldRef<"Purchase", 'String'>
    readonly merchantId: FieldRef<"Purchase", 'String'>
    readonly productId: FieldRef<"Purchase", 'String'>
    readonly totalAmount: FieldRef<"Purchase", 'Decimal'>
    readonly merchantAmount: FieldRef<"Purchase", 'Decimal'>
    readonly consumerCashback: FieldRef<"Purchase", 'Decimal'>
    readonly platformFee: FieldRef<"Purchase", 'Decimal'>
    readonly consumerReferrerFee: FieldRef<"Purchase", 'Decimal'>
    readonly merchantReferrerFee: FieldRef<"Purchase", 'Decimal'>
    readonly status: FieldRef<"Purchase", 'PurchaseStatus'>
    readonly txHash: FieldRef<"Purchase", 'String'>
    readonly createdAt: FieldRef<"Purchase", 'DateTime'>
    readonly completedAt: FieldRef<"Purchase", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Purchase findUnique
   */
  export type PurchaseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    /**
     * Filter, which Purchase to fetch.
     */
    where: PurchaseWhereUniqueInput
  }

  /**
   * Purchase findUniqueOrThrow
   */
  export type PurchaseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    /**
     * Filter, which Purchase to fetch.
     */
    where: PurchaseWhereUniqueInput
  }

  /**
   * Purchase findFirst
   */
  export type PurchaseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    /**
     * Filter, which Purchase to fetch.
     */
    where?: PurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Purchases to fetch.
     */
    orderBy?: PurchaseOrderByWithRelationInput | PurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Purchases.
     */
    cursor?: PurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Purchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Purchases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Purchases.
     */
    distinct?: PurchaseScalarFieldEnum | PurchaseScalarFieldEnum[]
  }

  /**
   * Purchase findFirstOrThrow
   */
  export type PurchaseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    /**
     * Filter, which Purchase to fetch.
     */
    where?: PurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Purchases to fetch.
     */
    orderBy?: PurchaseOrderByWithRelationInput | PurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Purchases.
     */
    cursor?: PurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Purchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Purchases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Purchases.
     */
    distinct?: PurchaseScalarFieldEnum | PurchaseScalarFieldEnum[]
  }

  /**
   * Purchase findMany
   */
  export type PurchaseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    /**
     * Filter, which Purchases to fetch.
     */
    where?: PurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Purchases to fetch.
     */
    orderBy?: PurchaseOrderByWithRelationInput | PurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Purchases.
     */
    cursor?: PurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Purchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Purchases.
     */
    skip?: number
    distinct?: PurchaseScalarFieldEnum | PurchaseScalarFieldEnum[]
  }

  /**
   * Purchase create
   */
  export type PurchaseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    /**
     * The data needed to create a Purchase.
     */
    data: XOR<PurchaseCreateInput, PurchaseUncheckedCreateInput>
  }

  /**
   * Purchase createMany
   */
  export type PurchaseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Purchases.
     */
    data: PurchaseCreateManyInput | PurchaseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Purchase createManyAndReturn
   */
  export type PurchaseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * The data used to create many Purchases.
     */
    data: PurchaseCreateManyInput | PurchaseCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Purchase update
   */
  export type PurchaseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    /**
     * The data needed to update a Purchase.
     */
    data: XOR<PurchaseUpdateInput, PurchaseUncheckedUpdateInput>
    /**
     * Choose, which Purchase to update.
     */
    where: PurchaseWhereUniqueInput
  }

  /**
   * Purchase updateMany
   */
  export type PurchaseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Purchases.
     */
    data: XOR<PurchaseUpdateManyMutationInput, PurchaseUncheckedUpdateManyInput>
    /**
     * Filter which Purchases to update
     */
    where?: PurchaseWhereInput
    /**
     * Limit how many Purchases to update.
     */
    limit?: number
  }

  /**
   * Purchase updateManyAndReturn
   */
  export type PurchaseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * The data used to update Purchases.
     */
    data: XOR<PurchaseUpdateManyMutationInput, PurchaseUncheckedUpdateManyInput>
    /**
     * Filter which Purchases to update
     */
    where?: PurchaseWhereInput
    /**
     * Limit how many Purchases to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Purchase upsert
   */
  export type PurchaseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    /**
     * The filter to search for the Purchase to update in case it exists.
     */
    where: PurchaseWhereUniqueInput
    /**
     * In case the Purchase found by the `where` argument doesn't exist, create a new Purchase with this data.
     */
    create: XOR<PurchaseCreateInput, PurchaseUncheckedCreateInput>
    /**
     * In case the Purchase was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PurchaseUpdateInput, PurchaseUncheckedUpdateInput>
  }

  /**
   * Purchase delete
   */
  export type PurchaseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
    /**
     * Filter which Purchase to delete.
     */
    where: PurchaseWhereUniqueInput
  }

  /**
   * Purchase deleteMany
   */
  export type PurchaseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Purchases to delete
     */
    where?: PurchaseWhereInput
    /**
     * Limit how many Purchases to delete.
     */
    limit?: number
  }

  /**
   * Purchase without action
   */
  export type PurchaseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Purchase
     */
    select?: PurchaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Purchase
     */
    omit?: PurchaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseInclude<ExtArgs> | null
  }


  /**
   * Model Campaign
   */

  export type AggregateCampaign = {
    _count: CampaignCountAggregateOutputType | null
    _avg: CampaignAvgAggregateOutputType | null
    _sum: CampaignSumAggregateOutputType | null
    _min: CampaignMinAggregateOutputType | null
    _max: CampaignMaxAggregateOutputType | null
  }

  export type CampaignAvgAggregateOutputType = {
    totalSent: number | null
    totalOpened: number | null
    totalClicked: number | null
  }

  export type CampaignSumAggregateOutputType = {
    totalSent: number | null
    totalOpened: number | null
    totalClicked: number | null
  }

  export type CampaignMinAggregateOutputType = {
    id: string | null
    title: string | null
    body: string | null
    type: $Enums.CampaignType | null
    status: $Enums.CampaignStatus | null
    targetAll: boolean | null
    targetCep: string | null
    actionUrl: string | null
    totalSent: number | null
    totalOpened: number | null
    totalClicked: number | null
    scheduledFor: Date | null
    sentAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CampaignMaxAggregateOutputType = {
    id: string | null
    title: string | null
    body: string | null
    type: $Enums.CampaignType | null
    status: $Enums.CampaignStatus | null
    targetAll: boolean | null
    targetCep: string | null
    actionUrl: string | null
    totalSent: number | null
    totalOpened: number | null
    totalClicked: number | null
    scheduledFor: Date | null
    sentAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CampaignCountAggregateOutputType = {
    id: number
    title: number
    body: number
    type: number
    status: number
    targetAll: number
    targetUserIds: number
    targetCep: number
    actionUrl: number
    totalSent: number
    totalOpened: number
    totalClicked: number
    scheduledFor: number
    sentAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CampaignAvgAggregateInputType = {
    totalSent?: true
    totalOpened?: true
    totalClicked?: true
  }

  export type CampaignSumAggregateInputType = {
    totalSent?: true
    totalOpened?: true
    totalClicked?: true
  }

  export type CampaignMinAggregateInputType = {
    id?: true
    title?: true
    body?: true
    type?: true
    status?: true
    targetAll?: true
    targetCep?: true
    actionUrl?: true
    totalSent?: true
    totalOpened?: true
    totalClicked?: true
    scheduledFor?: true
    sentAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CampaignMaxAggregateInputType = {
    id?: true
    title?: true
    body?: true
    type?: true
    status?: true
    targetAll?: true
    targetCep?: true
    actionUrl?: true
    totalSent?: true
    totalOpened?: true
    totalClicked?: true
    scheduledFor?: true
    sentAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CampaignCountAggregateInputType = {
    id?: true
    title?: true
    body?: true
    type?: true
    status?: true
    targetAll?: true
    targetUserIds?: true
    targetCep?: true
    actionUrl?: true
    totalSent?: true
    totalOpened?: true
    totalClicked?: true
    scheduledFor?: true
    sentAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CampaignAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Campaign to aggregate.
     */
    where?: CampaignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Campaigns to fetch.
     */
    orderBy?: CampaignOrderByWithRelationInput | CampaignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CampaignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Campaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Campaigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Campaigns
    **/
    _count?: true | CampaignCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CampaignAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CampaignSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CampaignMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CampaignMaxAggregateInputType
  }

  export type GetCampaignAggregateType<T extends CampaignAggregateArgs> = {
        [P in keyof T & keyof AggregateCampaign]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCampaign[P]>
      : GetScalarType<T[P], AggregateCampaign[P]>
  }




  export type CampaignGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CampaignWhereInput
    orderBy?: CampaignOrderByWithAggregationInput | CampaignOrderByWithAggregationInput[]
    by: CampaignScalarFieldEnum[] | CampaignScalarFieldEnum
    having?: CampaignScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CampaignCountAggregateInputType | true
    _avg?: CampaignAvgAggregateInputType
    _sum?: CampaignSumAggregateInputType
    _min?: CampaignMinAggregateInputType
    _max?: CampaignMaxAggregateInputType
  }

  export type CampaignGroupByOutputType = {
    id: string
    title: string
    body: string
    type: $Enums.CampaignType
    status: $Enums.CampaignStatus
    targetAll: boolean
    targetUserIds: JsonValue | null
    targetCep: string | null
    actionUrl: string | null
    totalSent: number
    totalOpened: number
    totalClicked: number
    scheduledFor: Date | null
    sentAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: CampaignCountAggregateOutputType | null
    _avg: CampaignAvgAggregateOutputType | null
    _sum: CampaignSumAggregateOutputType | null
    _min: CampaignMinAggregateOutputType | null
    _max: CampaignMaxAggregateOutputType | null
  }

  type GetCampaignGroupByPayload<T extends CampaignGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CampaignGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CampaignGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CampaignGroupByOutputType[P]>
            : GetScalarType<T[P], CampaignGroupByOutputType[P]>
        }
      >
    >


  export type CampaignSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    body?: boolean
    type?: boolean
    status?: boolean
    targetAll?: boolean
    targetUserIds?: boolean
    targetCep?: boolean
    actionUrl?: boolean
    totalSent?: boolean
    totalOpened?: boolean
    totalClicked?: boolean
    scheduledFor?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["campaign"]>

  export type CampaignSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    body?: boolean
    type?: boolean
    status?: boolean
    targetAll?: boolean
    targetUserIds?: boolean
    targetCep?: boolean
    actionUrl?: boolean
    totalSent?: boolean
    totalOpened?: boolean
    totalClicked?: boolean
    scheduledFor?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["campaign"]>

  export type CampaignSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    body?: boolean
    type?: boolean
    status?: boolean
    targetAll?: boolean
    targetUserIds?: boolean
    targetCep?: boolean
    actionUrl?: boolean
    totalSent?: boolean
    totalOpened?: boolean
    totalClicked?: boolean
    scheduledFor?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["campaign"]>

  export type CampaignSelectScalar = {
    id?: boolean
    title?: boolean
    body?: boolean
    type?: boolean
    status?: boolean
    targetAll?: boolean
    targetUserIds?: boolean
    targetCep?: boolean
    actionUrl?: boolean
    totalSent?: boolean
    totalOpened?: boolean
    totalClicked?: boolean
    scheduledFor?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CampaignOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "body" | "type" | "status" | "targetAll" | "targetUserIds" | "targetCep" | "actionUrl" | "totalSent" | "totalOpened" | "totalClicked" | "scheduledFor" | "sentAt" | "createdAt" | "updatedAt", ExtArgs["result"]["campaign"]>

  export type $CampaignPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Campaign"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      body: string
      type: $Enums.CampaignType
      status: $Enums.CampaignStatus
      targetAll: boolean
      targetUserIds: Prisma.JsonValue | null
      targetCep: string | null
      actionUrl: string | null
      totalSent: number
      totalOpened: number
      totalClicked: number
      scheduledFor: Date | null
      sentAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["campaign"]>
    composites: {}
  }

  type CampaignGetPayload<S extends boolean | null | undefined | CampaignDefaultArgs> = $Result.GetResult<Prisma.$CampaignPayload, S>

  type CampaignCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CampaignFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CampaignCountAggregateInputType | true
    }

  export interface CampaignDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Campaign'], meta: { name: 'Campaign' } }
    /**
     * Find zero or one Campaign that matches the filter.
     * @param {CampaignFindUniqueArgs} args - Arguments to find a Campaign
     * @example
     * // Get one Campaign
     * const campaign = await prisma.campaign.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CampaignFindUniqueArgs>(args: SelectSubset<T, CampaignFindUniqueArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Campaign that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CampaignFindUniqueOrThrowArgs} args - Arguments to find a Campaign
     * @example
     * // Get one Campaign
     * const campaign = await prisma.campaign.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CampaignFindUniqueOrThrowArgs>(args: SelectSubset<T, CampaignFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Campaign that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignFindFirstArgs} args - Arguments to find a Campaign
     * @example
     * // Get one Campaign
     * const campaign = await prisma.campaign.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CampaignFindFirstArgs>(args?: SelectSubset<T, CampaignFindFirstArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Campaign that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignFindFirstOrThrowArgs} args - Arguments to find a Campaign
     * @example
     * // Get one Campaign
     * const campaign = await prisma.campaign.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CampaignFindFirstOrThrowArgs>(args?: SelectSubset<T, CampaignFindFirstOrThrowArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Campaigns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Campaigns
     * const campaigns = await prisma.campaign.findMany()
     * 
     * // Get first 10 Campaigns
     * const campaigns = await prisma.campaign.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const campaignWithIdOnly = await prisma.campaign.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CampaignFindManyArgs>(args?: SelectSubset<T, CampaignFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Campaign.
     * @param {CampaignCreateArgs} args - Arguments to create a Campaign.
     * @example
     * // Create one Campaign
     * const Campaign = await prisma.campaign.create({
     *   data: {
     *     // ... data to create a Campaign
     *   }
     * })
     * 
     */
    create<T extends CampaignCreateArgs>(args: SelectSubset<T, CampaignCreateArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Campaigns.
     * @param {CampaignCreateManyArgs} args - Arguments to create many Campaigns.
     * @example
     * // Create many Campaigns
     * const campaign = await prisma.campaign.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CampaignCreateManyArgs>(args?: SelectSubset<T, CampaignCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Campaigns and returns the data saved in the database.
     * @param {CampaignCreateManyAndReturnArgs} args - Arguments to create many Campaigns.
     * @example
     * // Create many Campaigns
     * const campaign = await prisma.campaign.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Campaigns and only return the `id`
     * const campaignWithIdOnly = await prisma.campaign.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CampaignCreateManyAndReturnArgs>(args?: SelectSubset<T, CampaignCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Campaign.
     * @param {CampaignDeleteArgs} args - Arguments to delete one Campaign.
     * @example
     * // Delete one Campaign
     * const Campaign = await prisma.campaign.delete({
     *   where: {
     *     // ... filter to delete one Campaign
     *   }
     * })
     * 
     */
    delete<T extends CampaignDeleteArgs>(args: SelectSubset<T, CampaignDeleteArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Campaign.
     * @param {CampaignUpdateArgs} args - Arguments to update one Campaign.
     * @example
     * // Update one Campaign
     * const campaign = await prisma.campaign.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CampaignUpdateArgs>(args: SelectSubset<T, CampaignUpdateArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Campaigns.
     * @param {CampaignDeleteManyArgs} args - Arguments to filter Campaigns to delete.
     * @example
     * // Delete a few Campaigns
     * const { count } = await prisma.campaign.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CampaignDeleteManyArgs>(args?: SelectSubset<T, CampaignDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Campaigns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Campaigns
     * const campaign = await prisma.campaign.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CampaignUpdateManyArgs>(args: SelectSubset<T, CampaignUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Campaigns and returns the data updated in the database.
     * @param {CampaignUpdateManyAndReturnArgs} args - Arguments to update many Campaigns.
     * @example
     * // Update many Campaigns
     * const campaign = await prisma.campaign.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Campaigns and only return the `id`
     * const campaignWithIdOnly = await prisma.campaign.updateManyAndReturn({
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
    updateManyAndReturn<T extends CampaignUpdateManyAndReturnArgs>(args: SelectSubset<T, CampaignUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Campaign.
     * @param {CampaignUpsertArgs} args - Arguments to update or create a Campaign.
     * @example
     * // Update or create a Campaign
     * const campaign = await prisma.campaign.upsert({
     *   create: {
     *     // ... data to create a Campaign
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Campaign we want to update
     *   }
     * })
     */
    upsert<T extends CampaignUpsertArgs>(args: SelectSubset<T, CampaignUpsertArgs<ExtArgs>>): Prisma__CampaignClient<$Result.GetResult<Prisma.$CampaignPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Campaigns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignCountArgs} args - Arguments to filter Campaigns to count.
     * @example
     * // Count the number of Campaigns
     * const count = await prisma.campaign.count({
     *   where: {
     *     // ... the filter for the Campaigns we want to count
     *   }
     * })
    **/
    count<T extends CampaignCountArgs>(
      args?: Subset<T, CampaignCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CampaignCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Campaign.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CampaignAggregateArgs>(args: Subset<T, CampaignAggregateArgs>): Prisma.PrismaPromise<GetCampaignAggregateType<T>>

    /**
     * Group by Campaign.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CampaignGroupByArgs} args - Group by arguments.
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
      T extends CampaignGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CampaignGroupByArgs['orderBy'] }
        : { orderBy?: CampaignGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CampaignGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCampaignGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Campaign model
   */
  readonly fields: CampaignFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Campaign.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CampaignClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Campaign model
   */
  interface CampaignFieldRefs {
    readonly id: FieldRef<"Campaign", 'String'>
    readonly title: FieldRef<"Campaign", 'String'>
    readonly body: FieldRef<"Campaign", 'String'>
    readonly type: FieldRef<"Campaign", 'CampaignType'>
    readonly status: FieldRef<"Campaign", 'CampaignStatus'>
    readonly targetAll: FieldRef<"Campaign", 'Boolean'>
    readonly targetUserIds: FieldRef<"Campaign", 'Json'>
    readonly targetCep: FieldRef<"Campaign", 'String'>
    readonly actionUrl: FieldRef<"Campaign", 'String'>
    readonly totalSent: FieldRef<"Campaign", 'Int'>
    readonly totalOpened: FieldRef<"Campaign", 'Int'>
    readonly totalClicked: FieldRef<"Campaign", 'Int'>
    readonly scheduledFor: FieldRef<"Campaign", 'DateTime'>
    readonly sentAt: FieldRef<"Campaign", 'DateTime'>
    readonly createdAt: FieldRef<"Campaign", 'DateTime'>
    readonly updatedAt: FieldRef<"Campaign", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Campaign findUnique
   */
  export type CampaignFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Filter, which Campaign to fetch.
     */
    where: CampaignWhereUniqueInput
  }

  /**
   * Campaign findUniqueOrThrow
   */
  export type CampaignFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Filter, which Campaign to fetch.
     */
    where: CampaignWhereUniqueInput
  }

  /**
   * Campaign findFirst
   */
  export type CampaignFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Filter, which Campaign to fetch.
     */
    where?: CampaignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Campaigns to fetch.
     */
    orderBy?: CampaignOrderByWithRelationInput | CampaignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Campaigns.
     */
    cursor?: CampaignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Campaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Campaigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Campaigns.
     */
    distinct?: CampaignScalarFieldEnum | CampaignScalarFieldEnum[]
  }

  /**
   * Campaign findFirstOrThrow
   */
  export type CampaignFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Filter, which Campaign to fetch.
     */
    where?: CampaignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Campaigns to fetch.
     */
    orderBy?: CampaignOrderByWithRelationInput | CampaignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Campaigns.
     */
    cursor?: CampaignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Campaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Campaigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Campaigns.
     */
    distinct?: CampaignScalarFieldEnum | CampaignScalarFieldEnum[]
  }

  /**
   * Campaign findMany
   */
  export type CampaignFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Filter, which Campaigns to fetch.
     */
    where?: CampaignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Campaigns to fetch.
     */
    orderBy?: CampaignOrderByWithRelationInput | CampaignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Campaigns.
     */
    cursor?: CampaignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Campaigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Campaigns.
     */
    skip?: number
    distinct?: CampaignScalarFieldEnum | CampaignScalarFieldEnum[]
  }

  /**
   * Campaign create
   */
  export type CampaignCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * The data needed to create a Campaign.
     */
    data: XOR<CampaignCreateInput, CampaignUncheckedCreateInput>
  }

  /**
   * Campaign createMany
   */
  export type CampaignCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Campaigns.
     */
    data: CampaignCreateManyInput | CampaignCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Campaign createManyAndReturn
   */
  export type CampaignCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * The data used to create many Campaigns.
     */
    data: CampaignCreateManyInput | CampaignCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Campaign update
   */
  export type CampaignUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * The data needed to update a Campaign.
     */
    data: XOR<CampaignUpdateInput, CampaignUncheckedUpdateInput>
    /**
     * Choose, which Campaign to update.
     */
    where: CampaignWhereUniqueInput
  }

  /**
   * Campaign updateMany
   */
  export type CampaignUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Campaigns.
     */
    data: XOR<CampaignUpdateManyMutationInput, CampaignUncheckedUpdateManyInput>
    /**
     * Filter which Campaigns to update
     */
    where?: CampaignWhereInput
    /**
     * Limit how many Campaigns to update.
     */
    limit?: number
  }

  /**
   * Campaign updateManyAndReturn
   */
  export type CampaignUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * The data used to update Campaigns.
     */
    data: XOR<CampaignUpdateManyMutationInput, CampaignUncheckedUpdateManyInput>
    /**
     * Filter which Campaigns to update
     */
    where?: CampaignWhereInput
    /**
     * Limit how many Campaigns to update.
     */
    limit?: number
  }

  /**
   * Campaign upsert
   */
  export type CampaignUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * The filter to search for the Campaign to update in case it exists.
     */
    where: CampaignWhereUniqueInput
    /**
     * In case the Campaign found by the `where` argument doesn't exist, create a new Campaign with this data.
     */
    create: XOR<CampaignCreateInput, CampaignUncheckedCreateInput>
    /**
     * In case the Campaign was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CampaignUpdateInput, CampaignUncheckedUpdateInput>
  }

  /**
   * Campaign delete
   */
  export type CampaignDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
    /**
     * Filter which Campaign to delete.
     */
    where: CampaignWhereUniqueInput
  }

  /**
   * Campaign deleteMany
   */
  export type CampaignDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Campaigns to delete
     */
    where?: CampaignWhereInput
    /**
     * Limit how many Campaigns to delete.
     */
    limit?: number
  }

  /**
   * Campaign without action
   */
  export type CampaignDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Campaign
     */
    select?: CampaignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Campaign
     */
    omit?: CampaignOmit<ExtArgs> | null
  }


  /**
   * Model Notification
   */

  export type AggregateNotification = {
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  export type NotificationMinAggregateOutputType = {
    id: string | null
    userId: string | null
    type: $Enums.NotificationType | null
    title: string | null
    message: string | null
    isRead: boolean | null
    readAt: Date | null
    actionUrl: string | null
    createdAt: Date | null
  }

  export type NotificationMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    type: $Enums.NotificationType | null
    title: string | null
    message: string | null
    isRead: boolean | null
    readAt: Date | null
    actionUrl: string | null
    createdAt: Date | null
  }

  export type NotificationCountAggregateOutputType = {
    id: number
    userId: number
    type: number
    title: number
    message: number
    isRead: number
    readAt: number
    actionUrl: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type NotificationMinAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    title?: true
    message?: true
    isRead?: true
    readAt?: true
    actionUrl?: true
    createdAt?: true
  }

  export type NotificationMaxAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    title?: true
    message?: true
    isRead?: true
    readAt?: true
    actionUrl?: true
    createdAt?: true
  }

  export type NotificationCountAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    title?: true
    message?: true
    isRead?: true
    readAt?: true
    actionUrl?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type NotificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notification to aggregate.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notifications
    **/
    _count?: true | NotificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationMaxAggregateInputType
  }

  export type GetNotificationAggregateType<T extends NotificationAggregateArgs> = {
        [P in keyof T & keyof AggregateNotification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotification[P]>
      : GetScalarType<T[P], AggregateNotification[P]>
  }




  export type NotificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithAggregationInput | NotificationOrderByWithAggregationInput[]
    by: NotificationScalarFieldEnum[] | NotificationScalarFieldEnum
    having?: NotificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationCountAggregateInputType | true
    _min?: NotificationMinAggregateInputType
    _max?: NotificationMaxAggregateInputType
  }

  export type NotificationGroupByOutputType = {
    id: string
    userId: string
    type: $Enums.NotificationType
    title: string
    message: string
    isRead: boolean
    readAt: Date | null
    actionUrl: string | null
    metadata: JsonValue | null
    createdAt: Date
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  type GetNotificationGroupByPayload<T extends NotificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationGroupByOutputType[P]>
        }
      >
    >


  export type NotificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    readAt?: boolean
    actionUrl?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    readAt?: boolean
    actionUrl?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    readAt?: boolean
    actionUrl?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectScalar = {
    id?: boolean
    userId?: boolean
    type?: boolean
    title?: boolean
    message?: boolean
    isRead?: boolean
    readAt?: boolean
    actionUrl?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type NotificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "type" | "title" | "message" | "isRead" | "readAt" | "actionUrl" | "metadata" | "createdAt", ExtArgs["result"]["notification"]>
  export type NotificationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type NotificationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type NotificationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $NotificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notification"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      type: $Enums.NotificationType
      title: string
      message: string
      isRead: boolean
      readAt: Date | null
      actionUrl: string | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["notification"]>
    composites: {}
  }

  type NotificationGetPayload<S extends boolean | null | undefined | NotificationDefaultArgs> = $Result.GetResult<Prisma.$NotificationPayload, S>

  type NotificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NotificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NotificationCountAggregateInputType | true
    }

  export interface NotificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notification'], meta: { name: 'Notification' } }
    /**
     * Find zero or one Notification that matches the filter.
     * @param {NotificationFindUniqueArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationFindUniqueArgs>(args: SelectSubset<T, NotificationFindUniqueArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Notification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NotificationFindUniqueOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationFindFirstArgs>(args?: SelectSubset<T, NotificationFindFirstArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notification.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationWithIdOnly = await prisma.notification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationFindManyArgs>(args?: SelectSubset<T, NotificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Notification.
     * @param {NotificationCreateArgs} args - Arguments to create a Notification.
     * @example
     * // Create one Notification
     * const Notification = await prisma.notification.create({
     *   data: {
     *     // ... data to create a Notification
     *   }
     * })
     * 
     */
    create<T extends NotificationCreateArgs>(args: SelectSubset<T, NotificationCreateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Notifications.
     * @param {NotificationCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationCreateManyArgs>(args?: SelectSubset<T, NotificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notifications and returns the data saved in the database.
     * @param {NotificationCreateManyAndReturnArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificationCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Notification.
     * @param {NotificationDeleteArgs} args - Arguments to delete one Notification.
     * @example
     * // Delete one Notification
     * const Notification = await prisma.notification.delete({
     *   where: {
     *     // ... filter to delete one Notification
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeleteArgs>(args: SelectSubset<T, NotificationDeleteArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Notification.
     * @param {NotificationUpdateArgs} args - Arguments to update one Notification.
     * @example
     * // Update one Notification
     * const notification = await prisma.notification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationUpdateArgs>(args: SelectSubset<T, NotificationUpdateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Notifications.
     * @param {NotificationDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeleteManyArgs>(args?: SelectSubset<T, NotificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationUpdateManyArgs>(args: SelectSubset<T, NotificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications and returns the data updated in the database.
     * @param {NotificationUpdateManyAndReturnArgs} args - Arguments to update many Notifications.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.updateManyAndReturn({
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
    updateManyAndReturn<T extends NotificationUpdateManyAndReturnArgs>(args: SelectSubset<T, NotificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Notification.
     * @param {NotificationUpsertArgs} args - Arguments to update or create a Notification.
     * @example
     * // Update or create a Notification
     * const notification = await prisma.notification.upsert({
     *   create: {
     *     // ... data to create a Notification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notification we want to update
     *   }
     * })
     */
    upsert<T extends NotificationUpsertArgs>(args: SelectSubset<T, NotificationUpsertArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notification.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends NotificationCountArgs>(
      args?: Subset<T, NotificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends NotificationAggregateArgs>(args: Subset<T, NotificationAggregateArgs>): Prisma.PrismaPromise<GetNotificationAggregateType<T>>

    /**
     * Group by Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationGroupByArgs} args - Group by arguments.
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
      T extends NotificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationGroupByArgs['orderBy'] }
        : { orderBy?: NotificationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, NotificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notification model
   */
  readonly fields: NotificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Notification model
   */
  interface NotificationFieldRefs {
    readonly id: FieldRef<"Notification", 'String'>
    readonly userId: FieldRef<"Notification", 'String'>
    readonly type: FieldRef<"Notification", 'NotificationType'>
    readonly title: FieldRef<"Notification", 'String'>
    readonly message: FieldRef<"Notification", 'String'>
    readonly isRead: FieldRef<"Notification", 'Boolean'>
    readonly readAt: FieldRef<"Notification", 'DateTime'>
    readonly actionUrl: FieldRef<"Notification", 'String'>
    readonly metadata: FieldRef<"Notification", 'Json'>
    readonly createdAt: FieldRef<"Notification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Notification findUnique
   */
  export type NotificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findUniqueOrThrow
   */
  export type NotificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findFirst
   */
  export type NotificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findFirstOrThrow
   */
  export type NotificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findMany
   */
  export type NotificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notifications to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification create
   */
  export type NotificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to create a Notification.
     */
    data: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
  }

  /**
   * Notification createMany
   */
  export type NotificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification createManyAndReturn
   */
  export type NotificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification update
   */
  export type NotificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to update a Notification.
     */
    data: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
    /**
     * Choose, which Notification to update.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification updateMany
   */
  export type NotificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
  }

  /**
   * Notification updateManyAndReturn
   */
  export type NotificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification upsert
   */
  export type NotificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The filter to search for the Notification to update in case it exists.
     */
    where: NotificationWhereUniqueInput
    /**
     * In case the Notification found by the `where` argument doesn't exist, create a new Notification with this data.
     */
    create: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
    /**
     * In case the Notification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
  }

  /**
   * Notification delete
   */
  export type NotificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter which Notification to delete.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification deleteMany
   */
  export type NotificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notifications to delete
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to delete.
     */
    limit?: number
  }

  /**
   * Notification without action
   */
  export type NotificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
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


  export const UserScalarFieldEnum: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    username: 'username',
    cpf: 'cpf',
    phone: 'phone',
    birthDate: 'birthDate',
    password: 'password',
    passwordChangedAt: 'passwordChangedAt',
    profilePicture: 'profilePicture',
    userType: 'userType',
    merchantStatus: 'merchantStatus',
    publicKey: 'publicKey',
    privateKey: 'privateKey',
    referralId: 'referralId',
    referredBy: 'referredBy',
    address: 'address',
    isActive: 'isActive',
    accountStatus: 'accountStatus',
    lastLoginAt: 'lastLoginAt',
    emailConfirmed: 'emailConfirmed',
    failedLoginAttempts: 'failedLoginAttempts',
    lastFailedLoginAt: 'lastFailedLoginAt',
    isBlockedLoginAttempts: 'isBlockedLoginAttempts',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const UserModuleScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    moduleKey: 'moduleKey',
    isEnabled: 'isEnabled',
    reason: 'reason',
    enabledBy: 'enabledBy',
    disabledBy: 'disabledBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserModuleScalarFieldEnum = (typeof UserModuleScalarFieldEnum)[keyof typeof UserModuleScalarFieldEnum]


  export const UserCashbackConfigScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    consumerPercent: 'consumerPercent',
    clubPercent: 'clubPercent',
    consumerReferrerPercent: 'consumerReferrerPercent',
    merchantReferrerPercent: 'merchantReferrerPercent',
    reason: 'reason',
    configuredBy: 'configuredBy',
    configuredAt: 'configuredAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserCashbackConfigScalarFieldEnum = (typeof UserCashbackConfigScalarFieldEnum)[keyof typeof UserCashbackConfigScalarFieldEnum]


  export const UserPushTokenScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    token: 'token',
    platform: 'platform',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserPushTokenScalarFieldEnum = (typeof UserPushTokenScalarFieldEnum)[keyof typeof UserPushTokenScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    id: 'id',
    merchantId: 'merchantId',
    name: 'name',
    description: 'description',
    price: 'price',
    cashbackPercentage: 'cashbackPercentage',
    imageUrl: 'imageUrl',
    category: 'category',
    stock: 'stock',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const PurchaseScalarFieldEnum: {
    id: 'id',
    consumerId: 'consumerId',
    merchantId: 'merchantId',
    productId: 'productId',
    totalAmount: 'totalAmount',
    merchantAmount: 'merchantAmount',
    consumerCashback: 'consumerCashback',
    platformFee: 'platformFee',
    consumerReferrerFee: 'consumerReferrerFee',
    merchantReferrerFee: 'merchantReferrerFee',
    status: 'status',
    txHash: 'txHash',
    createdAt: 'createdAt',
    completedAt: 'completedAt'
  };

  export type PurchaseScalarFieldEnum = (typeof PurchaseScalarFieldEnum)[keyof typeof PurchaseScalarFieldEnum]


  export const CampaignScalarFieldEnum: {
    id: 'id',
    title: 'title',
    body: 'body',
    type: 'type',
    status: 'status',
    targetAll: 'targetAll',
    targetUserIds: 'targetUserIds',
    targetCep: 'targetCep',
    actionUrl: 'actionUrl',
    totalSent: 'totalSent',
    totalOpened: 'totalOpened',
    totalClicked: 'totalClicked',
    scheduledFor: 'scheduledFor',
    sentAt: 'sentAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CampaignScalarFieldEnum = (typeof CampaignScalarFieldEnum)[keyof typeof CampaignScalarFieldEnum]


  export const NotificationScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    title: 'title',
    message: 'message',
    isRead: 'isRead',
    readAt: 'readAt',
    actionUrl: 'actionUrl',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum]


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


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


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
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'UserType'
   */
  export type EnumUserTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserType'>
    


  /**
   * Reference to a field of type 'UserType[]'
   */
  export type ListEnumUserTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserType[]'>
    


  /**
   * Reference to a field of type 'MerchantStatus'
   */
  export type EnumMerchantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MerchantStatus'>
    


  /**
   * Reference to a field of type 'MerchantStatus[]'
   */
  export type ListEnumMerchantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MerchantStatus[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'AccountStatus'
   */
  export type EnumAccountStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AccountStatus'>
    


  /**
   * Reference to a field of type 'AccountStatus[]'
   */
  export type ListEnumAccountStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AccountStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Platform'
   */
  export type EnumPlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Platform'>
    


  /**
   * Reference to a field of type 'Platform[]'
   */
  export type ListEnumPlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Platform[]'>
    


  /**
   * Reference to a field of type 'PurchaseStatus'
   */
  export type EnumPurchaseStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PurchaseStatus'>
    


  /**
   * Reference to a field of type 'PurchaseStatus[]'
   */
  export type ListEnumPurchaseStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PurchaseStatus[]'>
    


  /**
   * Reference to a field of type 'CampaignType'
   */
  export type EnumCampaignTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CampaignType'>
    


  /**
   * Reference to a field of type 'CampaignType[]'
   */
  export type ListEnumCampaignTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CampaignType[]'>
    


  /**
   * Reference to a field of type 'CampaignStatus'
   */
  export type EnumCampaignStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CampaignStatus'>
    


  /**
   * Reference to a field of type 'CampaignStatus[]'
   */
  export type ListEnumCampaignStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CampaignStatus[]'>
    


  /**
   * Reference to a field of type 'NotificationType'
   */
  export type EnumNotificationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationType'>
    


  /**
   * Reference to a field of type 'NotificationType[]'
   */
  export type ListEnumNotificationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationType[]'>
    


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


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: UuidFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    cpf?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    birthDate?: DateTimeNullableFilter<"User"> | Date | string | null
    password?: StringFilter<"User"> | string
    passwordChangedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    profilePicture?: StringNullableFilter<"User"> | string | null
    userType?: EnumUserTypeFilter<"User"> | $Enums.UserType
    merchantStatus?: EnumMerchantStatusNullableFilter<"User"> | $Enums.MerchantStatus | null
    publicKey?: StringNullableFilter<"User"> | string | null
    privateKey?: StringNullableFilter<"User"> | string | null
    referralId?: StringNullableFilter<"User"> | string | null
    referredBy?: StringNullableFilter<"User"> | string | null
    address?: JsonNullableFilter<"User">
    isActive?: BoolFilter<"User"> | boolean
    accountStatus?: EnumAccountStatusFilter<"User"> | $Enums.AccountStatus
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    emailConfirmed?: BoolFilter<"User"> | boolean
    failedLoginAttempts?: IntFilter<"User"> | number
    lastFailedLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    isBlockedLoginAttempts?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    products?: ProductListRelationFilter
    purchases?: PurchaseListRelationFilter
    sales?: PurchaseListRelationFilter
    pushTokens?: UserPushTokenListRelationFilter
    notifications?: NotificationListRelationFilter
    userModules?: UserModuleListRelationFilter
    cashbackConfig?: XOR<UserCashbackConfigNullableScalarRelationFilter, UserCashbackConfigWhereInput> | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    username?: SortOrder
    cpf?: SortOrder
    phone?: SortOrderInput | SortOrder
    birthDate?: SortOrderInput | SortOrder
    password?: SortOrder
    passwordChangedAt?: SortOrderInput | SortOrder
    profilePicture?: SortOrderInput | SortOrder
    userType?: SortOrder
    merchantStatus?: SortOrderInput | SortOrder
    publicKey?: SortOrderInput | SortOrder
    privateKey?: SortOrderInput | SortOrder
    referralId?: SortOrderInput | SortOrder
    referredBy?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    isActive?: SortOrder
    accountStatus?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    emailConfirmed?: SortOrder
    failedLoginAttempts?: SortOrder
    lastFailedLoginAt?: SortOrderInput | SortOrder
    isBlockedLoginAttempts?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    products?: ProductOrderByRelationAggregateInput
    purchases?: PurchaseOrderByRelationAggregateInput
    sales?: PurchaseOrderByRelationAggregateInput
    pushTokens?: UserPushTokenOrderByRelationAggregateInput
    notifications?: NotificationOrderByRelationAggregateInput
    userModules?: UserModuleOrderByRelationAggregateInput
    cashbackConfig?: UserCashbackConfigOrderByWithRelationInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    username?: string
    cpf?: string
    publicKey?: string
    referralId?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    birthDate?: DateTimeNullableFilter<"User"> | Date | string | null
    password?: StringFilter<"User"> | string
    passwordChangedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    profilePicture?: StringNullableFilter<"User"> | string | null
    userType?: EnumUserTypeFilter<"User"> | $Enums.UserType
    merchantStatus?: EnumMerchantStatusNullableFilter<"User"> | $Enums.MerchantStatus | null
    privateKey?: StringNullableFilter<"User"> | string | null
    referredBy?: StringNullableFilter<"User"> | string | null
    address?: JsonNullableFilter<"User">
    isActive?: BoolFilter<"User"> | boolean
    accountStatus?: EnumAccountStatusFilter<"User"> | $Enums.AccountStatus
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    emailConfirmed?: BoolFilter<"User"> | boolean
    failedLoginAttempts?: IntFilter<"User"> | number
    lastFailedLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    isBlockedLoginAttempts?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    products?: ProductListRelationFilter
    purchases?: PurchaseListRelationFilter
    sales?: PurchaseListRelationFilter
    pushTokens?: UserPushTokenListRelationFilter
    notifications?: NotificationListRelationFilter
    userModules?: UserModuleListRelationFilter
    cashbackConfig?: XOR<UserCashbackConfigNullableScalarRelationFilter, UserCashbackConfigWhereInput> | null
  }, "id" | "email" | "username" | "cpf" | "publicKey" | "referralId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    username?: SortOrder
    cpf?: SortOrder
    phone?: SortOrderInput | SortOrder
    birthDate?: SortOrderInput | SortOrder
    password?: SortOrder
    passwordChangedAt?: SortOrderInput | SortOrder
    profilePicture?: SortOrderInput | SortOrder
    userType?: SortOrder
    merchantStatus?: SortOrderInput | SortOrder
    publicKey?: SortOrderInput | SortOrder
    privateKey?: SortOrderInput | SortOrder
    referralId?: SortOrderInput | SortOrder
    referredBy?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    isActive?: SortOrder
    accountStatus?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    emailConfirmed?: SortOrder
    failedLoginAttempts?: SortOrder
    lastFailedLoginAt?: SortOrderInput | SortOrder
    isBlockedLoginAttempts?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"User"> | string
    firstName?: StringWithAggregatesFilter<"User"> | string
    lastName?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    username?: StringWithAggregatesFilter<"User"> | string
    cpf?: StringWithAggregatesFilter<"User"> | string
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null
    birthDate?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    password?: StringWithAggregatesFilter<"User"> | string
    passwordChangedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    profilePicture?: StringNullableWithAggregatesFilter<"User"> | string | null
    userType?: EnumUserTypeWithAggregatesFilter<"User"> | $Enums.UserType
    merchantStatus?: EnumMerchantStatusNullableWithAggregatesFilter<"User"> | $Enums.MerchantStatus | null
    publicKey?: StringNullableWithAggregatesFilter<"User"> | string | null
    privateKey?: StringNullableWithAggregatesFilter<"User"> | string | null
    referralId?: StringNullableWithAggregatesFilter<"User"> | string | null
    referredBy?: StringNullableWithAggregatesFilter<"User"> | string | null
    address?: JsonNullableWithAggregatesFilter<"User">
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    accountStatus?: EnumAccountStatusWithAggregatesFilter<"User"> | $Enums.AccountStatus
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    emailConfirmed?: BoolWithAggregatesFilter<"User"> | boolean
    failedLoginAttempts?: IntWithAggregatesFilter<"User"> | number
    lastFailedLoginAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    isBlockedLoginAttempts?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type UserModuleWhereInput = {
    AND?: UserModuleWhereInput | UserModuleWhereInput[]
    OR?: UserModuleWhereInput[]
    NOT?: UserModuleWhereInput | UserModuleWhereInput[]
    id?: UuidFilter<"UserModule"> | string
    userId?: UuidFilter<"UserModule"> | string
    moduleKey?: StringFilter<"UserModule"> | string
    isEnabled?: BoolFilter<"UserModule"> | boolean
    reason?: StringNullableFilter<"UserModule"> | string | null
    enabledBy?: UuidNullableFilter<"UserModule"> | string | null
    disabledBy?: UuidNullableFilter<"UserModule"> | string | null
    createdAt?: DateTimeFilter<"UserModule"> | Date | string
    updatedAt?: DateTimeFilter<"UserModule"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserModuleOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    moduleKey?: SortOrder
    isEnabled?: SortOrder
    reason?: SortOrderInput | SortOrder
    enabledBy?: SortOrderInput | SortOrder
    disabledBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserModuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_moduleKey?: UserModuleUserIdModuleKeyCompoundUniqueInput
    AND?: UserModuleWhereInput | UserModuleWhereInput[]
    OR?: UserModuleWhereInput[]
    NOT?: UserModuleWhereInput | UserModuleWhereInput[]
    userId?: UuidFilter<"UserModule"> | string
    moduleKey?: StringFilter<"UserModule"> | string
    isEnabled?: BoolFilter<"UserModule"> | boolean
    reason?: StringNullableFilter<"UserModule"> | string | null
    enabledBy?: UuidNullableFilter<"UserModule"> | string | null
    disabledBy?: UuidNullableFilter<"UserModule"> | string | null
    createdAt?: DateTimeFilter<"UserModule"> | Date | string
    updatedAt?: DateTimeFilter<"UserModule"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId_moduleKey">

  export type UserModuleOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    moduleKey?: SortOrder
    isEnabled?: SortOrder
    reason?: SortOrderInput | SortOrder
    enabledBy?: SortOrderInput | SortOrder
    disabledBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserModuleCountOrderByAggregateInput
    _max?: UserModuleMaxOrderByAggregateInput
    _min?: UserModuleMinOrderByAggregateInput
  }

  export type UserModuleScalarWhereWithAggregatesInput = {
    AND?: UserModuleScalarWhereWithAggregatesInput | UserModuleScalarWhereWithAggregatesInput[]
    OR?: UserModuleScalarWhereWithAggregatesInput[]
    NOT?: UserModuleScalarWhereWithAggregatesInput | UserModuleScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"UserModule"> | string
    userId?: UuidWithAggregatesFilter<"UserModule"> | string
    moduleKey?: StringWithAggregatesFilter<"UserModule"> | string
    isEnabled?: BoolWithAggregatesFilter<"UserModule"> | boolean
    reason?: StringNullableWithAggregatesFilter<"UserModule"> | string | null
    enabledBy?: UuidNullableWithAggregatesFilter<"UserModule"> | string | null
    disabledBy?: UuidNullableWithAggregatesFilter<"UserModule"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"UserModule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserModule"> | Date | string
  }

  export type UserCashbackConfigWhereInput = {
    AND?: UserCashbackConfigWhereInput | UserCashbackConfigWhereInput[]
    OR?: UserCashbackConfigWhereInput[]
    NOT?: UserCashbackConfigWhereInput | UserCashbackConfigWhereInput[]
    id?: UuidFilter<"UserCashbackConfig"> | string
    userId?: UuidFilter<"UserCashbackConfig"> | string
    consumerPercent?: DecimalFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    reason?: StringNullableFilter<"UserCashbackConfig"> | string | null
    configuredBy?: UuidNullableFilter<"UserCashbackConfig"> | string | null
    configuredAt?: DateTimeFilter<"UserCashbackConfig"> | Date | string
    createdAt?: DateTimeFilter<"UserCashbackConfig"> | Date | string
    updatedAt?: DateTimeFilter<"UserCashbackConfig"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserCashbackConfigOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
    reason?: SortOrderInput | SortOrder
    configuredBy?: SortOrderInput | SortOrder
    configuredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserCashbackConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: UserCashbackConfigWhereInput | UserCashbackConfigWhereInput[]
    OR?: UserCashbackConfigWhereInput[]
    NOT?: UserCashbackConfigWhereInput | UserCashbackConfigWhereInput[]
    consumerPercent?: DecimalFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    reason?: StringNullableFilter<"UserCashbackConfig"> | string | null
    configuredBy?: UuidNullableFilter<"UserCashbackConfig"> | string | null
    configuredAt?: DateTimeFilter<"UserCashbackConfig"> | Date | string
    createdAt?: DateTimeFilter<"UserCashbackConfig"> | Date | string
    updatedAt?: DateTimeFilter<"UserCashbackConfig"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type UserCashbackConfigOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
    reason?: SortOrderInput | SortOrder
    configuredBy?: SortOrderInput | SortOrder
    configuredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCashbackConfigCountOrderByAggregateInput
    _avg?: UserCashbackConfigAvgOrderByAggregateInput
    _max?: UserCashbackConfigMaxOrderByAggregateInput
    _min?: UserCashbackConfigMinOrderByAggregateInput
    _sum?: UserCashbackConfigSumOrderByAggregateInput
  }

  export type UserCashbackConfigScalarWhereWithAggregatesInput = {
    AND?: UserCashbackConfigScalarWhereWithAggregatesInput | UserCashbackConfigScalarWhereWithAggregatesInput[]
    OR?: UserCashbackConfigScalarWhereWithAggregatesInput[]
    NOT?: UserCashbackConfigScalarWhereWithAggregatesInput | UserCashbackConfigScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"UserCashbackConfig"> | string
    userId?: UuidWithAggregatesFilter<"UserCashbackConfig"> | string
    consumerPercent?: DecimalWithAggregatesFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalWithAggregatesFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalWithAggregatesFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalWithAggregatesFilter<"UserCashbackConfig"> | Decimal | DecimalJsLike | number | string
    reason?: StringNullableWithAggregatesFilter<"UserCashbackConfig"> | string | null
    configuredBy?: UuidNullableWithAggregatesFilter<"UserCashbackConfig"> | string | null
    configuredAt?: DateTimeWithAggregatesFilter<"UserCashbackConfig"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"UserCashbackConfig"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserCashbackConfig"> | Date | string
  }

  export type UserPushTokenWhereInput = {
    AND?: UserPushTokenWhereInput | UserPushTokenWhereInput[]
    OR?: UserPushTokenWhereInput[]
    NOT?: UserPushTokenWhereInput | UserPushTokenWhereInput[]
    id?: UuidFilter<"UserPushToken"> | string
    userId?: UuidFilter<"UserPushToken"> | string
    token?: StringFilter<"UserPushToken"> | string
    platform?: EnumPlatformFilter<"UserPushToken"> | $Enums.Platform
    isActive?: BoolFilter<"UserPushToken"> | boolean
    createdAt?: DateTimeFilter<"UserPushToken"> | Date | string
    updatedAt?: DateTimeFilter<"UserPushToken"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserPushTokenOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    platform?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserPushTokenWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: UserPushTokenWhereInput | UserPushTokenWhereInput[]
    OR?: UserPushTokenWhereInput[]
    NOT?: UserPushTokenWhereInput | UserPushTokenWhereInput[]
    userId?: UuidFilter<"UserPushToken"> | string
    platform?: EnumPlatformFilter<"UserPushToken"> | $Enums.Platform
    isActive?: BoolFilter<"UserPushToken"> | boolean
    createdAt?: DateTimeFilter<"UserPushToken"> | Date | string
    updatedAt?: DateTimeFilter<"UserPushToken"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "token">

  export type UserPushTokenOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    platform?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserPushTokenCountOrderByAggregateInput
    _max?: UserPushTokenMaxOrderByAggregateInput
    _min?: UserPushTokenMinOrderByAggregateInput
  }

  export type UserPushTokenScalarWhereWithAggregatesInput = {
    AND?: UserPushTokenScalarWhereWithAggregatesInput | UserPushTokenScalarWhereWithAggregatesInput[]
    OR?: UserPushTokenScalarWhereWithAggregatesInput[]
    NOT?: UserPushTokenScalarWhereWithAggregatesInput | UserPushTokenScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"UserPushToken"> | string
    userId?: UuidWithAggregatesFilter<"UserPushToken"> | string
    token?: StringWithAggregatesFilter<"UserPushToken"> | string
    platform?: EnumPlatformWithAggregatesFilter<"UserPushToken"> | $Enums.Platform
    isActive?: BoolWithAggregatesFilter<"UserPushToken"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"UserPushToken"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserPushToken"> | Date | string
  }

  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: UuidFilter<"Product"> | string
    merchantId?: UuidFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringFilter<"Product"> | string
    price?: DecimalFilter<"Product"> | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFilter<"Product"> | Decimal | DecimalJsLike | number | string
    imageUrl?: StringNullableFilter<"Product"> | string | null
    category?: StringNullableFilter<"Product"> | string | null
    stock?: IntFilter<"Product"> | number
    isActive?: BoolFilter<"Product"> | boolean
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    merchant?: XOR<UserScalarRelationFilter, UserWhereInput>
    purchases?: PurchaseListRelationFilter
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    merchantId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    cashbackPercentage?: SortOrder
    imageUrl?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    stock?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    merchant?: UserOrderByWithRelationInput
    purchases?: PurchaseOrderByRelationAggregateInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    merchantId?: UuidFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringFilter<"Product"> | string
    price?: DecimalFilter<"Product"> | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFilter<"Product"> | Decimal | DecimalJsLike | number | string
    imageUrl?: StringNullableFilter<"Product"> | string | null
    category?: StringNullableFilter<"Product"> | string | null
    stock?: IntFilter<"Product"> | number
    isActive?: BoolFilter<"Product"> | boolean
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    merchant?: XOR<UserScalarRelationFilter, UserWhereInput>
    purchases?: PurchaseListRelationFilter
  }, "id">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    merchantId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    cashbackPercentage?: SortOrder
    imageUrl?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    stock?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductCountOrderByAggregateInput
    _avg?: ProductAvgOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
    _sum?: ProductSumOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Product"> | string
    merchantId?: UuidWithAggregatesFilter<"Product"> | string
    name?: StringWithAggregatesFilter<"Product"> | string
    description?: StringWithAggregatesFilter<"Product"> | string
    price?: DecimalWithAggregatesFilter<"Product"> | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalWithAggregatesFilter<"Product"> | Decimal | DecimalJsLike | number | string
    imageUrl?: StringNullableWithAggregatesFilter<"Product"> | string | null
    category?: StringNullableWithAggregatesFilter<"Product"> | string | null
    stock?: IntWithAggregatesFilter<"Product"> | number
    isActive?: BoolWithAggregatesFilter<"Product"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
  }

  export type PurchaseWhereInput = {
    AND?: PurchaseWhereInput | PurchaseWhereInput[]
    OR?: PurchaseWhereInput[]
    NOT?: PurchaseWhereInput | PurchaseWhereInput[]
    id?: UuidFilter<"Purchase"> | string
    consumerId?: UuidFilter<"Purchase"> | string
    merchantId?: UuidFilter<"Purchase"> | string
    productId?: UuidFilter<"Purchase"> | string
    totalAmount?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFilter<"Purchase"> | $Enums.PurchaseStatus
    txHash?: StringNullableFilter<"Purchase"> | string | null
    createdAt?: DateTimeFilter<"Purchase"> | Date | string
    completedAt?: DateTimeNullableFilter<"Purchase"> | Date | string | null
    consumer?: XOR<UserScalarRelationFilter, UserWhereInput>
    merchant?: XOR<UserScalarRelationFilter, UserWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }

  export type PurchaseOrderByWithRelationInput = {
    id?: SortOrder
    consumerId?: SortOrder
    merchantId?: SortOrder
    productId?: SortOrder
    totalAmount?: SortOrder
    merchantAmount?: SortOrder
    consumerCashback?: SortOrder
    platformFee?: SortOrder
    consumerReferrerFee?: SortOrder
    merchantReferrerFee?: SortOrder
    status?: SortOrder
    txHash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    consumer?: UserOrderByWithRelationInput
    merchant?: UserOrderByWithRelationInput
    product?: ProductOrderByWithRelationInput
  }

  export type PurchaseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PurchaseWhereInput | PurchaseWhereInput[]
    OR?: PurchaseWhereInput[]
    NOT?: PurchaseWhereInput | PurchaseWhereInput[]
    consumerId?: UuidFilter<"Purchase"> | string
    merchantId?: UuidFilter<"Purchase"> | string
    productId?: UuidFilter<"Purchase"> | string
    totalAmount?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFilter<"Purchase"> | $Enums.PurchaseStatus
    txHash?: StringNullableFilter<"Purchase"> | string | null
    createdAt?: DateTimeFilter<"Purchase"> | Date | string
    completedAt?: DateTimeNullableFilter<"Purchase"> | Date | string | null
    consumer?: XOR<UserScalarRelationFilter, UserWhereInput>
    merchant?: XOR<UserScalarRelationFilter, UserWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }, "id">

  export type PurchaseOrderByWithAggregationInput = {
    id?: SortOrder
    consumerId?: SortOrder
    merchantId?: SortOrder
    productId?: SortOrder
    totalAmount?: SortOrder
    merchantAmount?: SortOrder
    consumerCashback?: SortOrder
    platformFee?: SortOrder
    consumerReferrerFee?: SortOrder
    merchantReferrerFee?: SortOrder
    status?: SortOrder
    txHash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    _count?: PurchaseCountOrderByAggregateInput
    _avg?: PurchaseAvgOrderByAggregateInput
    _max?: PurchaseMaxOrderByAggregateInput
    _min?: PurchaseMinOrderByAggregateInput
    _sum?: PurchaseSumOrderByAggregateInput
  }

  export type PurchaseScalarWhereWithAggregatesInput = {
    AND?: PurchaseScalarWhereWithAggregatesInput | PurchaseScalarWhereWithAggregatesInput[]
    OR?: PurchaseScalarWhereWithAggregatesInput[]
    NOT?: PurchaseScalarWhereWithAggregatesInput | PurchaseScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Purchase"> | string
    consumerId?: UuidWithAggregatesFilter<"Purchase"> | string
    merchantId?: UuidWithAggregatesFilter<"Purchase"> | string
    productId?: UuidWithAggregatesFilter<"Purchase"> | string
    totalAmount?: DecimalWithAggregatesFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalWithAggregatesFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalWithAggregatesFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalWithAggregatesFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalWithAggregatesFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalWithAggregatesFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusWithAggregatesFilter<"Purchase"> | $Enums.PurchaseStatus
    txHash?: StringNullableWithAggregatesFilter<"Purchase"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Purchase"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"Purchase"> | Date | string | null
  }

  export type CampaignWhereInput = {
    AND?: CampaignWhereInput | CampaignWhereInput[]
    OR?: CampaignWhereInput[]
    NOT?: CampaignWhereInput | CampaignWhereInput[]
    id?: UuidFilter<"Campaign"> | string
    title?: StringFilter<"Campaign"> | string
    body?: StringFilter<"Campaign"> | string
    type?: EnumCampaignTypeFilter<"Campaign"> | $Enums.CampaignType
    status?: EnumCampaignStatusFilter<"Campaign"> | $Enums.CampaignStatus
    targetAll?: BoolFilter<"Campaign"> | boolean
    targetUserIds?: JsonNullableFilter<"Campaign">
    targetCep?: StringNullableFilter<"Campaign"> | string | null
    actionUrl?: StringNullableFilter<"Campaign"> | string | null
    totalSent?: IntFilter<"Campaign"> | number
    totalOpened?: IntFilter<"Campaign"> | number
    totalClicked?: IntFilter<"Campaign"> | number
    scheduledFor?: DateTimeNullableFilter<"Campaign"> | Date | string | null
    sentAt?: DateTimeNullableFilter<"Campaign"> | Date | string | null
    createdAt?: DateTimeFilter<"Campaign"> | Date | string
    updatedAt?: DateTimeFilter<"Campaign"> | Date | string
  }

  export type CampaignOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    body?: SortOrder
    type?: SortOrder
    status?: SortOrder
    targetAll?: SortOrder
    targetUserIds?: SortOrderInput | SortOrder
    targetCep?: SortOrderInput | SortOrder
    actionUrl?: SortOrderInput | SortOrder
    totalSent?: SortOrder
    totalOpened?: SortOrder
    totalClicked?: SortOrder
    scheduledFor?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CampaignWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CampaignWhereInput | CampaignWhereInput[]
    OR?: CampaignWhereInput[]
    NOT?: CampaignWhereInput | CampaignWhereInput[]
    title?: StringFilter<"Campaign"> | string
    body?: StringFilter<"Campaign"> | string
    type?: EnumCampaignTypeFilter<"Campaign"> | $Enums.CampaignType
    status?: EnumCampaignStatusFilter<"Campaign"> | $Enums.CampaignStatus
    targetAll?: BoolFilter<"Campaign"> | boolean
    targetUserIds?: JsonNullableFilter<"Campaign">
    targetCep?: StringNullableFilter<"Campaign"> | string | null
    actionUrl?: StringNullableFilter<"Campaign"> | string | null
    totalSent?: IntFilter<"Campaign"> | number
    totalOpened?: IntFilter<"Campaign"> | number
    totalClicked?: IntFilter<"Campaign"> | number
    scheduledFor?: DateTimeNullableFilter<"Campaign"> | Date | string | null
    sentAt?: DateTimeNullableFilter<"Campaign"> | Date | string | null
    createdAt?: DateTimeFilter<"Campaign"> | Date | string
    updatedAt?: DateTimeFilter<"Campaign"> | Date | string
  }, "id">

  export type CampaignOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    body?: SortOrder
    type?: SortOrder
    status?: SortOrder
    targetAll?: SortOrder
    targetUserIds?: SortOrderInput | SortOrder
    targetCep?: SortOrderInput | SortOrder
    actionUrl?: SortOrderInput | SortOrder
    totalSent?: SortOrder
    totalOpened?: SortOrder
    totalClicked?: SortOrder
    scheduledFor?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CampaignCountOrderByAggregateInput
    _avg?: CampaignAvgOrderByAggregateInput
    _max?: CampaignMaxOrderByAggregateInput
    _min?: CampaignMinOrderByAggregateInput
    _sum?: CampaignSumOrderByAggregateInput
  }

  export type CampaignScalarWhereWithAggregatesInput = {
    AND?: CampaignScalarWhereWithAggregatesInput | CampaignScalarWhereWithAggregatesInput[]
    OR?: CampaignScalarWhereWithAggregatesInput[]
    NOT?: CampaignScalarWhereWithAggregatesInput | CampaignScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Campaign"> | string
    title?: StringWithAggregatesFilter<"Campaign"> | string
    body?: StringWithAggregatesFilter<"Campaign"> | string
    type?: EnumCampaignTypeWithAggregatesFilter<"Campaign"> | $Enums.CampaignType
    status?: EnumCampaignStatusWithAggregatesFilter<"Campaign"> | $Enums.CampaignStatus
    targetAll?: BoolWithAggregatesFilter<"Campaign"> | boolean
    targetUserIds?: JsonNullableWithAggregatesFilter<"Campaign">
    targetCep?: StringNullableWithAggregatesFilter<"Campaign"> | string | null
    actionUrl?: StringNullableWithAggregatesFilter<"Campaign"> | string | null
    totalSent?: IntWithAggregatesFilter<"Campaign"> | number
    totalOpened?: IntWithAggregatesFilter<"Campaign"> | number
    totalClicked?: IntWithAggregatesFilter<"Campaign"> | number
    scheduledFor?: DateTimeNullableWithAggregatesFilter<"Campaign"> | Date | string | null
    sentAt?: DateTimeNullableWithAggregatesFilter<"Campaign"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Campaign"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Campaign"> | Date | string
  }

  export type NotificationWhereInput = {
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    id?: UuidFilter<"Notification"> | string
    userId?: UuidFilter<"Notification"> | string
    type?: EnumNotificationTypeFilter<"Notification"> | $Enums.NotificationType
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    readAt?: DateTimeNullableFilter<"Notification"> | Date | string | null
    actionUrl?: StringNullableFilter<"Notification"> | string | null
    metadata?: JsonNullableFilter<"Notification">
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type NotificationOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    readAt?: SortOrderInput | SortOrder
    actionUrl?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type NotificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    userId?: UuidFilter<"Notification"> | string
    type?: EnumNotificationTypeFilter<"Notification"> | $Enums.NotificationType
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    readAt?: DateTimeNullableFilter<"Notification"> | Date | string | null
    actionUrl?: StringNullableFilter<"Notification"> | string | null
    metadata?: JsonNullableFilter<"Notification">
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type NotificationOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    readAt?: SortOrderInput | SortOrder
    actionUrl?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: NotificationCountOrderByAggregateInput
    _max?: NotificationMaxOrderByAggregateInput
    _min?: NotificationMinOrderByAggregateInput
  }

  export type NotificationScalarWhereWithAggregatesInput = {
    AND?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    OR?: NotificationScalarWhereWithAggregatesInput[]
    NOT?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Notification"> | string
    userId?: UuidWithAggregatesFilter<"Notification"> | string
    type?: EnumNotificationTypeWithAggregatesFilter<"Notification"> | $Enums.NotificationType
    title?: StringWithAggregatesFilter<"Notification"> | string
    message?: StringWithAggregatesFilter<"Notification"> | string
    isRead?: BoolWithAggregatesFilter<"Notification"> | boolean
    readAt?: DateTimeNullableWithAggregatesFilter<"Notification"> | Date | string | null
    actionUrl?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"Notification">
    createdAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseCreateNestedManyWithoutConsumerInput
    sales?: PurchaseCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenCreateNestedManyWithoutUserInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    userModules?: UserModuleCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseUncheckedCreateNestedManyWithoutConsumerInput
    sales?: PurchaseUncheckedCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenUncheckedCreateNestedManyWithoutUserInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    userModules?: UserModuleUncheckedCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUpdateManyWithoutUserNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUncheckedUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUncheckedUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUncheckedUpdateManyWithoutUserNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUncheckedUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserModuleCreateInput = {
    id?: string
    moduleKey: string
    isEnabled: boolean
    reason?: string | null
    enabledBy?: string | null
    disabledBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutUserModulesInput
  }

  export type UserModuleUncheckedCreateInput = {
    id?: string
    userId: string
    moduleKey: string
    isEnabled: boolean
    reason?: string | null
    enabledBy?: string | null
    disabledBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserModuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleKey?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    enabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    disabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutUserModulesNestedInput
  }

  export type UserModuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    moduleKey?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    enabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    disabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserModuleCreateManyInput = {
    id?: string
    userId: string
    moduleKey: string
    isEnabled: boolean
    reason?: string | null
    enabledBy?: string | null
    disabledBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserModuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleKey?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    enabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    disabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserModuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    moduleKey?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    enabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    disabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCashbackConfigCreateInput = {
    id?: string
    consumerPercent: Decimal | DecimalJsLike | number | string
    clubPercent: Decimal | DecimalJsLike | number | string
    consumerReferrerPercent: Decimal | DecimalJsLike | number | string
    merchantReferrerPercent: Decimal | DecimalJsLike | number | string
    reason?: string | null
    configuredBy?: string | null
    configuredAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutCashbackConfigInput
  }

  export type UserCashbackConfigUncheckedCreateInput = {
    id?: string
    userId: string
    consumerPercent: Decimal | DecimalJsLike | number | string
    clubPercent: Decimal | DecimalJsLike | number | string
    consumerReferrerPercent: Decimal | DecimalJsLike | number | string
    merchantReferrerPercent: Decimal | DecimalJsLike | number | string
    reason?: string | null
    configuredBy?: string | null
    configuredAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCashbackConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    configuredBy?: NullableStringFieldUpdateOperationsInput | string | null
    configuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCashbackConfigNestedInput
  }

  export type UserCashbackConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    configuredBy?: NullableStringFieldUpdateOperationsInput | string | null
    configuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCashbackConfigCreateManyInput = {
    id?: string
    userId: string
    consumerPercent: Decimal | DecimalJsLike | number | string
    clubPercent: Decimal | DecimalJsLike | number | string
    consumerReferrerPercent: Decimal | DecimalJsLike | number | string
    merchantReferrerPercent: Decimal | DecimalJsLike | number | string
    reason?: string | null
    configuredBy?: string | null
    configuredAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCashbackConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    configuredBy?: NullableStringFieldUpdateOperationsInput | string | null
    configuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCashbackConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    configuredBy?: NullableStringFieldUpdateOperationsInput | string | null
    configuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPushTokenCreateInput = {
    id?: string
    token: string
    platform: $Enums.Platform
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPushTokensInput
  }

  export type UserPushTokenUncheckedCreateInput = {
    id?: string
    userId: string
    token: string
    platform: $Enums.Platform
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserPushTokenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPushTokensNestedInput
  }

  export type UserPushTokenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPushTokenCreateManyInput = {
    id?: string
    userId: string
    token: string
    platform: $Enums.Platform
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserPushTokenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPushTokenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateInput = {
    id?: string
    name: string
    description: string
    price: Decimal | DecimalJsLike | number | string
    cashbackPercentage: Decimal | DecimalJsLike | number | string
    imageUrl?: string | null
    category?: string | null
    stock?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    merchant: UserCreateNestedOneWithoutProductsInput
    purchases?: PurchaseCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateInput = {
    id?: string
    merchantId: string
    name: string
    description: string
    price: Decimal | DecimalJsLike | number | string
    cashbackPercentage: Decimal | DecimalJsLike | number | string
    imageUrl?: string | null
    category?: string | null
    stock?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    purchases?: PurchaseUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchant?: UserUpdateOneRequiredWithoutProductsNestedInput
    purchases?: PurchaseUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchases?: PurchaseUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductCreateManyInput = {
    id?: string
    merchantId: string
    name: string
    description: string
    price: Decimal | DecimalJsLike | number | string
    cashbackPercentage: Decimal | DecimalJsLike | number | string
    imageUrl?: string | null
    category?: string | null
    stock?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseCreateInput = {
    id?: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
    consumer: UserCreateNestedOneWithoutPurchasesInput
    merchant: UserCreateNestedOneWithoutSalesInput
    product: ProductCreateNestedOneWithoutPurchasesInput
  }

  export type PurchaseUncheckedCreateInput = {
    id?: string
    consumerId: string
    merchantId: string
    productId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type PurchaseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumer?: UserUpdateOneRequiredWithoutPurchasesNestedInput
    merchant?: UserUpdateOneRequiredWithoutSalesNestedInput
    product?: ProductUpdateOneRequiredWithoutPurchasesNestedInput
  }

  export type PurchaseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerId?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PurchaseCreateManyInput = {
    id?: string
    consumerId: string
    merchantId: string
    productId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type PurchaseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PurchaseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerId?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CampaignCreateInput = {
    id?: string
    title: string
    body: string
    type: $Enums.CampaignType
    status?: $Enums.CampaignStatus
    targetAll?: boolean
    targetUserIds?: NullableJsonNullValueInput | InputJsonValue
    targetCep?: string | null
    actionUrl?: string | null
    totalSent?: number
    totalOpened?: number
    totalClicked?: number
    scheduledFor?: Date | string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CampaignUncheckedCreateInput = {
    id?: string
    title: string
    body: string
    type: $Enums.CampaignType
    status?: $Enums.CampaignStatus
    targetAll?: boolean
    targetUserIds?: NullableJsonNullValueInput | InputJsonValue
    targetCep?: string | null
    actionUrl?: string | null
    totalSent?: number
    totalOpened?: number
    totalClicked?: number
    scheduledFor?: Date | string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CampaignUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    type?: EnumCampaignTypeFieldUpdateOperationsInput | $Enums.CampaignType
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    targetAll?: BoolFieldUpdateOperationsInput | boolean
    targetUserIds?: NullableJsonNullValueInput | InputJsonValue
    targetCep?: NullableStringFieldUpdateOperationsInput | string | null
    actionUrl?: NullableStringFieldUpdateOperationsInput | string | null
    totalSent?: IntFieldUpdateOperationsInput | number
    totalOpened?: IntFieldUpdateOperationsInput | number
    totalClicked?: IntFieldUpdateOperationsInput | number
    scheduledFor?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CampaignUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    type?: EnumCampaignTypeFieldUpdateOperationsInput | $Enums.CampaignType
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    targetAll?: BoolFieldUpdateOperationsInput | boolean
    targetUserIds?: NullableJsonNullValueInput | InputJsonValue
    targetCep?: NullableStringFieldUpdateOperationsInput | string | null
    actionUrl?: NullableStringFieldUpdateOperationsInput | string | null
    totalSent?: IntFieldUpdateOperationsInput | number
    totalOpened?: IntFieldUpdateOperationsInput | number
    totalClicked?: IntFieldUpdateOperationsInput | number
    scheduledFor?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CampaignCreateManyInput = {
    id?: string
    title: string
    body: string
    type: $Enums.CampaignType
    status?: $Enums.CampaignStatus
    targetAll?: boolean
    targetUserIds?: NullableJsonNullValueInput | InputJsonValue
    targetCep?: string | null
    actionUrl?: string | null
    totalSent?: number
    totalOpened?: number
    totalClicked?: number
    scheduledFor?: Date | string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CampaignUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    type?: EnumCampaignTypeFieldUpdateOperationsInput | $Enums.CampaignType
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    targetAll?: BoolFieldUpdateOperationsInput | boolean
    targetUserIds?: NullableJsonNullValueInput | InputJsonValue
    targetCep?: NullableStringFieldUpdateOperationsInput | string | null
    actionUrl?: NullableStringFieldUpdateOperationsInput | string | null
    totalSent?: IntFieldUpdateOperationsInput | number
    totalOpened?: IntFieldUpdateOperationsInput | number
    totalClicked?: IntFieldUpdateOperationsInput | number
    scheduledFor?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CampaignUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    type?: EnumCampaignTypeFieldUpdateOperationsInput | $Enums.CampaignType
    status?: EnumCampaignStatusFieldUpdateOperationsInput | $Enums.CampaignStatus
    targetAll?: BoolFieldUpdateOperationsInput | boolean
    targetUserIds?: NullableJsonNullValueInput | InputJsonValue
    targetCep?: NullableStringFieldUpdateOperationsInput | string | null
    actionUrl?: NullableStringFieldUpdateOperationsInput | string | null
    totalSent?: IntFieldUpdateOperationsInput | number
    totalOpened?: IntFieldUpdateOperationsInput | number
    totalClicked?: IntFieldUpdateOperationsInput | number
    scheduledFor?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateInput = {
    id?: string
    type: $Enums.NotificationType
    title: string
    message: string
    isRead?: boolean
    readAt?: Date | string | null
    actionUrl?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutNotificationsInput
  }

  export type NotificationUncheckedCreateInput = {
    id?: string
    userId: string
    type: $Enums.NotificationType
    title: string
    message: string
    isRead?: boolean
    readAt?: Date | string | null
    actionUrl?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type NotificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    actionUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutNotificationsNestedInput
  }

  export type NotificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    actionUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateManyInput = {
    id?: string
    userId: string
    type: $Enums.NotificationType
    title: string
    message: string
    isRead?: boolean
    readAt?: Date | string | null
    actionUrl?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type NotificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    actionUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    actionUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
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

  export type EnumUserTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeFilter<$PrismaModel> | $Enums.UserType
  }

  export type EnumMerchantStatusNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.MerchantStatus | EnumMerchantStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.MerchantStatus[] | ListEnumMerchantStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MerchantStatus[] | ListEnumMerchantStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMerchantStatusNullableFilter<$PrismaModel> | $Enums.MerchantStatus | null
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EnumAccountStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountStatusFilter<$PrismaModel> | $Enums.AccountStatus
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

  export type ProductListRelationFilter = {
    every?: ProductWhereInput
    some?: ProductWhereInput
    none?: ProductWhereInput
  }

  export type PurchaseListRelationFilter = {
    every?: PurchaseWhereInput
    some?: PurchaseWhereInput
    none?: PurchaseWhereInput
  }

  export type UserPushTokenListRelationFilter = {
    every?: UserPushTokenWhereInput
    some?: UserPushTokenWhereInput
    none?: UserPushTokenWhereInput
  }

  export type NotificationListRelationFilter = {
    every?: NotificationWhereInput
    some?: NotificationWhereInput
    none?: NotificationWhereInput
  }

  export type UserModuleListRelationFilter = {
    every?: UserModuleWhereInput
    some?: UserModuleWhereInput
    none?: UserModuleWhereInput
  }

  export type UserCashbackConfigNullableScalarRelationFilter = {
    is?: UserCashbackConfigWhereInput | null
    isNot?: UserCashbackConfigWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ProductOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PurchaseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserPushTokenOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type NotificationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserModuleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    username?: SortOrder
    cpf?: SortOrder
    phone?: SortOrder
    birthDate?: SortOrder
    password?: SortOrder
    passwordChangedAt?: SortOrder
    profilePicture?: SortOrder
    userType?: SortOrder
    merchantStatus?: SortOrder
    publicKey?: SortOrder
    privateKey?: SortOrder
    referralId?: SortOrder
    referredBy?: SortOrder
    address?: SortOrder
    isActive?: SortOrder
    accountStatus?: SortOrder
    lastLoginAt?: SortOrder
    emailConfirmed?: SortOrder
    failedLoginAttempts?: SortOrder
    lastFailedLoginAt?: SortOrder
    isBlockedLoginAttempts?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    failedLoginAttempts?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    username?: SortOrder
    cpf?: SortOrder
    phone?: SortOrder
    birthDate?: SortOrder
    password?: SortOrder
    passwordChangedAt?: SortOrder
    profilePicture?: SortOrder
    userType?: SortOrder
    merchantStatus?: SortOrder
    publicKey?: SortOrder
    privateKey?: SortOrder
    referralId?: SortOrder
    referredBy?: SortOrder
    isActive?: SortOrder
    accountStatus?: SortOrder
    lastLoginAt?: SortOrder
    emailConfirmed?: SortOrder
    failedLoginAttempts?: SortOrder
    lastFailedLoginAt?: SortOrder
    isBlockedLoginAttempts?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    username?: SortOrder
    cpf?: SortOrder
    phone?: SortOrder
    birthDate?: SortOrder
    password?: SortOrder
    passwordChangedAt?: SortOrder
    profilePicture?: SortOrder
    userType?: SortOrder
    merchantStatus?: SortOrder
    publicKey?: SortOrder
    privateKey?: SortOrder
    referralId?: SortOrder
    referredBy?: SortOrder
    isActive?: SortOrder
    accountStatus?: SortOrder
    lastLoginAt?: SortOrder
    emailConfirmed?: SortOrder
    failedLoginAttempts?: SortOrder
    lastFailedLoginAt?: SortOrder
    isBlockedLoginAttempts?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    failedLoginAttempts?: SortOrder
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

  export type EnumUserTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeWithAggregatesFilter<$PrismaModel> | $Enums.UserType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserTypeFilter<$PrismaModel>
    _max?: NestedEnumUserTypeFilter<$PrismaModel>
  }

  export type EnumMerchantStatusNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MerchantStatus | EnumMerchantStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.MerchantStatus[] | ListEnumMerchantStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MerchantStatus[] | ListEnumMerchantStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMerchantStatusNullableWithAggregatesFilter<$PrismaModel> | $Enums.MerchantStatus | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumMerchantStatusNullableFilter<$PrismaModel>
    _max?: NestedEnumMerchantStatusNullableFilter<$PrismaModel>
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumAccountStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountStatusWithAggregatesFilter<$PrismaModel> | $Enums.AccountStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAccountStatusFilter<$PrismaModel>
    _max?: NestedEnumAccountStatusFilter<$PrismaModel>
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

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserModuleUserIdModuleKeyCompoundUniqueInput = {
    userId: string
    moduleKey: string
  }

  export type UserModuleCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    moduleKey?: SortOrder
    isEnabled?: SortOrder
    reason?: SortOrder
    enabledBy?: SortOrder
    disabledBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserModuleMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    moduleKey?: SortOrder
    isEnabled?: SortOrder
    reason?: SortOrder
    enabledBy?: SortOrder
    disabledBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserModuleMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    moduleKey?: SortOrder
    isEnabled?: SortOrder
    reason?: SortOrder
    enabledBy?: SortOrder
    disabledBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
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

  export type UserCashbackConfigCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
    reason?: SortOrder
    configuredBy?: SortOrder
    configuredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserCashbackConfigAvgOrderByAggregateInput = {
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
  }

  export type UserCashbackConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
    reason?: SortOrder
    configuredBy?: SortOrder
    configuredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserCashbackConfigMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
    reason?: SortOrder
    configuredBy?: SortOrder
    configuredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserCashbackConfigSumOrderByAggregateInput = {
    consumerPercent?: SortOrder
    clubPercent?: SortOrder
    consumerReferrerPercent?: SortOrder
    merchantReferrerPercent?: SortOrder
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

  export type EnumPlatformFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformFilter<$PrismaModel> | $Enums.Platform
  }

  export type UserPushTokenCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    platform?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserPushTokenMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    platform?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserPushTokenMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    platform?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumPlatformWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformWithAggregatesFilter<$PrismaModel> | $Enums.Platform
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlatformFilter<$PrismaModel>
    _max?: NestedEnumPlatformFilter<$PrismaModel>
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    merchantId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    cashbackPercentage?: SortOrder
    imageUrl?: SortOrder
    category?: SortOrder
    stock?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductAvgOrderByAggregateInput = {
    price?: SortOrder
    cashbackPercentage?: SortOrder
    stock?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    merchantId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    cashbackPercentage?: SortOrder
    imageUrl?: SortOrder
    category?: SortOrder
    stock?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    merchantId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    cashbackPercentage?: SortOrder
    imageUrl?: SortOrder
    category?: SortOrder
    stock?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductSumOrderByAggregateInput = {
    price?: SortOrder
    cashbackPercentage?: SortOrder
    stock?: SortOrder
  }

  export type EnumPurchaseStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PurchaseStatus | EnumPurchaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PurchaseStatus[] | ListEnumPurchaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PurchaseStatus[] | ListEnumPurchaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPurchaseStatusFilter<$PrismaModel> | $Enums.PurchaseStatus
  }

  export type ProductScalarRelationFilter = {
    is?: ProductWhereInput
    isNot?: ProductWhereInput
  }

  export type PurchaseCountOrderByAggregateInput = {
    id?: SortOrder
    consumerId?: SortOrder
    merchantId?: SortOrder
    productId?: SortOrder
    totalAmount?: SortOrder
    merchantAmount?: SortOrder
    consumerCashback?: SortOrder
    platformFee?: SortOrder
    consumerReferrerFee?: SortOrder
    merchantReferrerFee?: SortOrder
    status?: SortOrder
    txHash?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
  }

  export type PurchaseAvgOrderByAggregateInput = {
    totalAmount?: SortOrder
    merchantAmount?: SortOrder
    consumerCashback?: SortOrder
    platformFee?: SortOrder
    consumerReferrerFee?: SortOrder
    merchantReferrerFee?: SortOrder
  }

  export type PurchaseMaxOrderByAggregateInput = {
    id?: SortOrder
    consumerId?: SortOrder
    merchantId?: SortOrder
    productId?: SortOrder
    totalAmount?: SortOrder
    merchantAmount?: SortOrder
    consumerCashback?: SortOrder
    platformFee?: SortOrder
    consumerReferrerFee?: SortOrder
    merchantReferrerFee?: SortOrder
    status?: SortOrder
    txHash?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
  }

  export type PurchaseMinOrderByAggregateInput = {
    id?: SortOrder
    consumerId?: SortOrder
    merchantId?: SortOrder
    productId?: SortOrder
    totalAmount?: SortOrder
    merchantAmount?: SortOrder
    consumerCashback?: SortOrder
    platformFee?: SortOrder
    consumerReferrerFee?: SortOrder
    merchantReferrerFee?: SortOrder
    status?: SortOrder
    txHash?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
  }

  export type PurchaseSumOrderByAggregateInput = {
    totalAmount?: SortOrder
    merchantAmount?: SortOrder
    consumerCashback?: SortOrder
    platformFee?: SortOrder
    consumerReferrerFee?: SortOrder
    merchantReferrerFee?: SortOrder
  }

  export type EnumPurchaseStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PurchaseStatus | EnumPurchaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PurchaseStatus[] | ListEnumPurchaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PurchaseStatus[] | ListEnumPurchaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPurchaseStatusWithAggregatesFilter<$PrismaModel> | $Enums.PurchaseStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPurchaseStatusFilter<$PrismaModel>
    _max?: NestedEnumPurchaseStatusFilter<$PrismaModel>
  }

  export type EnumCampaignTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignType | EnumCampaignTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignType[] | ListEnumCampaignTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignType[] | ListEnumCampaignTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignTypeFilter<$PrismaModel> | $Enums.CampaignType
  }

  export type EnumCampaignStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignStatus | EnumCampaignStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignStatusFilter<$PrismaModel> | $Enums.CampaignStatus
  }

  export type CampaignCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    body?: SortOrder
    type?: SortOrder
    status?: SortOrder
    targetAll?: SortOrder
    targetUserIds?: SortOrder
    targetCep?: SortOrder
    actionUrl?: SortOrder
    totalSent?: SortOrder
    totalOpened?: SortOrder
    totalClicked?: SortOrder
    scheduledFor?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CampaignAvgOrderByAggregateInput = {
    totalSent?: SortOrder
    totalOpened?: SortOrder
    totalClicked?: SortOrder
  }

  export type CampaignMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    body?: SortOrder
    type?: SortOrder
    status?: SortOrder
    targetAll?: SortOrder
    targetCep?: SortOrder
    actionUrl?: SortOrder
    totalSent?: SortOrder
    totalOpened?: SortOrder
    totalClicked?: SortOrder
    scheduledFor?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CampaignMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    body?: SortOrder
    type?: SortOrder
    status?: SortOrder
    targetAll?: SortOrder
    targetCep?: SortOrder
    actionUrl?: SortOrder
    totalSent?: SortOrder
    totalOpened?: SortOrder
    totalClicked?: SortOrder
    scheduledFor?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CampaignSumOrderByAggregateInput = {
    totalSent?: SortOrder
    totalOpened?: SortOrder
    totalClicked?: SortOrder
  }

  export type EnumCampaignTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignType | EnumCampaignTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignType[] | ListEnumCampaignTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignType[] | ListEnumCampaignTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignTypeWithAggregatesFilter<$PrismaModel> | $Enums.CampaignType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCampaignTypeFilter<$PrismaModel>
    _max?: NestedEnumCampaignTypeFilter<$PrismaModel>
  }

  export type EnumCampaignStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignStatus | EnumCampaignStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignStatusWithAggregatesFilter<$PrismaModel> | $Enums.CampaignStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCampaignStatusFilter<$PrismaModel>
    _max?: NestedEnumCampaignStatusFilter<$PrismaModel>
  }

  export type EnumNotificationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeFilter<$PrismaModel> | $Enums.NotificationType
  }

  export type NotificationCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    readAt?: SortOrder
    actionUrl?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    readAt?: SortOrder
    actionUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    title?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    readAt?: SortOrder
    actionUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumNotificationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeWithAggregatesFilter<$PrismaModel> | $Enums.NotificationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNotificationTypeFilter<$PrismaModel>
    _max?: NestedEnumNotificationTypeFilter<$PrismaModel>
  }

  export type ProductCreateNestedManyWithoutMerchantInput = {
    create?: XOR<ProductCreateWithoutMerchantInput, ProductUncheckedCreateWithoutMerchantInput> | ProductCreateWithoutMerchantInput[] | ProductUncheckedCreateWithoutMerchantInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutMerchantInput | ProductCreateOrConnectWithoutMerchantInput[]
    createMany?: ProductCreateManyMerchantInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type PurchaseCreateNestedManyWithoutConsumerInput = {
    create?: XOR<PurchaseCreateWithoutConsumerInput, PurchaseUncheckedCreateWithoutConsumerInput> | PurchaseCreateWithoutConsumerInput[] | PurchaseUncheckedCreateWithoutConsumerInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutConsumerInput | PurchaseCreateOrConnectWithoutConsumerInput[]
    createMany?: PurchaseCreateManyConsumerInputEnvelope
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
  }

  export type PurchaseCreateNestedManyWithoutMerchantInput = {
    create?: XOR<PurchaseCreateWithoutMerchantInput, PurchaseUncheckedCreateWithoutMerchantInput> | PurchaseCreateWithoutMerchantInput[] | PurchaseUncheckedCreateWithoutMerchantInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutMerchantInput | PurchaseCreateOrConnectWithoutMerchantInput[]
    createMany?: PurchaseCreateManyMerchantInputEnvelope
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
  }

  export type UserPushTokenCreateNestedManyWithoutUserInput = {
    create?: XOR<UserPushTokenCreateWithoutUserInput, UserPushTokenUncheckedCreateWithoutUserInput> | UserPushTokenCreateWithoutUserInput[] | UserPushTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPushTokenCreateOrConnectWithoutUserInput | UserPushTokenCreateOrConnectWithoutUserInput[]
    createMany?: UserPushTokenCreateManyUserInputEnvelope
    connect?: UserPushTokenWhereUniqueInput | UserPushTokenWhereUniqueInput[]
  }

  export type NotificationCreateNestedManyWithoutUserInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type UserModuleCreateNestedManyWithoutUserInput = {
    create?: XOR<UserModuleCreateWithoutUserInput, UserModuleUncheckedCreateWithoutUserInput> | UserModuleCreateWithoutUserInput[] | UserModuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserModuleCreateOrConnectWithoutUserInput | UserModuleCreateOrConnectWithoutUserInput[]
    createMany?: UserModuleCreateManyUserInputEnvelope
    connect?: UserModuleWhereUniqueInput | UserModuleWhereUniqueInput[]
  }

  export type UserCashbackConfigCreateNestedOneWithoutUserInput = {
    create?: XOR<UserCashbackConfigCreateWithoutUserInput, UserCashbackConfigUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserCashbackConfigCreateOrConnectWithoutUserInput
    connect?: UserCashbackConfigWhereUniqueInput
  }

  export type ProductUncheckedCreateNestedManyWithoutMerchantInput = {
    create?: XOR<ProductCreateWithoutMerchantInput, ProductUncheckedCreateWithoutMerchantInput> | ProductCreateWithoutMerchantInput[] | ProductUncheckedCreateWithoutMerchantInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutMerchantInput | ProductCreateOrConnectWithoutMerchantInput[]
    createMany?: ProductCreateManyMerchantInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type PurchaseUncheckedCreateNestedManyWithoutConsumerInput = {
    create?: XOR<PurchaseCreateWithoutConsumerInput, PurchaseUncheckedCreateWithoutConsumerInput> | PurchaseCreateWithoutConsumerInput[] | PurchaseUncheckedCreateWithoutConsumerInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutConsumerInput | PurchaseCreateOrConnectWithoutConsumerInput[]
    createMany?: PurchaseCreateManyConsumerInputEnvelope
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
  }

  export type PurchaseUncheckedCreateNestedManyWithoutMerchantInput = {
    create?: XOR<PurchaseCreateWithoutMerchantInput, PurchaseUncheckedCreateWithoutMerchantInput> | PurchaseCreateWithoutMerchantInput[] | PurchaseUncheckedCreateWithoutMerchantInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutMerchantInput | PurchaseCreateOrConnectWithoutMerchantInput[]
    createMany?: PurchaseCreateManyMerchantInputEnvelope
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
  }

  export type UserPushTokenUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserPushTokenCreateWithoutUserInput, UserPushTokenUncheckedCreateWithoutUserInput> | UserPushTokenCreateWithoutUserInput[] | UserPushTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPushTokenCreateOrConnectWithoutUserInput | UserPushTokenCreateOrConnectWithoutUserInput[]
    createMany?: UserPushTokenCreateManyUserInputEnvelope
    connect?: UserPushTokenWhereUniqueInput | UserPushTokenWhereUniqueInput[]
  }

  export type NotificationUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type UserModuleUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserModuleCreateWithoutUserInput, UserModuleUncheckedCreateWithoutUserInput> | UserModuleCreateWithoutUserInput[] | UserModuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserModuleCreateOrConnectWithoutUserInput | UserModuleCreateOrConnectWithoutUserInput[]
    createMany?: UserModuleCreateManyUserInputEnvelope
    connect?: UserModuleWhereUniqueInput | UserModuleWhereUniqueInput[]
  }

  export type UserCashbackConfigUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<UserCashbackConfigCreateWithoutUserInput, UserCashbackConfigUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserCashbackConfigCreateOrConnectWithoutUserInput
    connect?: UserCashbackConfigWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumUserTypeFieldUpdateOperationsInput = {
    set?: $Enums.UserType
  }

  export type NullableEnumMerchantStatusFieldUpdateOperationsInput = {
    set?: $Enums.MerchantStatus | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EnumAccountStatusFieldUpdateOperationsInput = {
    set?: $Enums.AccountStatus
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ProductUpdateManyWithoutMerchantNestedInput = {
    create?: XOR<ProductCreateWithoutMerchantInput, ProductUncheckedCreateWithoutMerchantInput> | ProductCreateWithoutMerchantInput[] | ProductUncheckedCreateWithoutMerchantInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutMerchantInput | ProductCreateOrConnectWithoutMerchantInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutMerchantInput | ProductUpsertWithWhereUniqueWithoutMerchantInput[]
    createMany?: ProductCreateManyMerchantInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutMerchantInput | ProductUpdateWithWhereUniqueWithoutMerchantInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutMerchantInput | ProductUpdateManyWithWhereWithoutMerchantInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type PurchaseUpdateManyWithoutConsumerNestedInput = {
    create?: XOR<PurchaseCreateWithoutConsumerInput, PurchaseUncheckedCreateWithoutConsumerInput> | PurchaseCreateWithoutConsumerInput[] | PurchaseUncheckedCreateWithoutConsumerInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutConsumerInput | PurchaseCreateOrConnectWithoutConsumerInput[]
    upsert?: PurchaseUpsertWithWhereUniqueWithoutConsumerInput | PurchaseUpsertWithWhereUniqueWithoutConsumerInput[]
    createMany?: PurchaseCreateManyConsumerInputEnvelope
    set?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    disconnect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    delete?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    update?: PurchaseUpdateWithWhereUniqueWithoutConsumerInput | PurchaseUpdateWithWhereUniqueWithoutConsumerInput[]
    updateMany?: PurchaseUpdateManyWithWhereWithoutConsumerInput | PurchaseUpdateManyWithWhereWithoutConsumerInput[]
    deleteMany?: PurchaseScalarWhereInput | PurchaseScalarWhereInput[]
  }

  export type PurchaseUpdateManyWithoutMerchantNestedInput = {
    create?: XOR<PurchaseCreateWithoutMerchantInput, PurchaseUncheckedCreateWithoutMerchantInput> | PurchaseCreateWithoutMerchantInput[] | PurchaseUncheckedCreateWithoutMerchantInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutMerchantInput | PurchaseCreateOrConnectWithoutMerchantInput[]
    upsert?: PurchaseUpsertWithWhereUniqueWithoutMerchantInput | PurchaseUpsertWithWhereUniqueWithoutMerchantInput[]
    createMany?: PurchaseCreateManyMerchantInputEnvelope
    set?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    disconnect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    delete?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    update?: PurchaseUpdateWithWhereUniqueWithoutMerchantInput | PurchaseUpdateWithWhereUniqueWithoutMerchantInput[]
    updateMany?: PurchaseUpdateManyWithWhereWithoutMerchantInput | PurchaseUpdateManyWithWhereWithoutMerchantInput[]
    deleteMany?: PurchaseScalarWhereInput | PurchaseScalarWhereInput[]
  }

  export type UserPushTokenUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserPushTokenCreateWithoutUserInput, UserPushTokenUncheckedCreateWithoutUserInput> | UserPushTokenCreateWithoutUserInput[] | UserPushTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPushTokenCreateOrConnectWithoutUserInput | UserPushTokenCreateOrConnectWithoutUserInput[]
    upsert?: UserPushTokenUpsertWithWhereUniqueWithoutUserInput | UserPushTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserPushTokenCreateManyUserInputEnvelope
    set?: UserPushTokenWhereUniqueInput | UserPushTokenWhereUniqueInput[]
    disconnect?: UserPushTokenWhereUniqueInput | UserPushTokenWhereUniqueInput[]
    delete?: UserPushTokenWhereUniqueInput | UserPushTokenWhereUniqueInput[]
    connect?: UserPushTokenWhereUniqueInput | UserPushTokenWhereUniqueInput[]
    update?: UserPushTokenUpdateWithWhereUniqueWithoutUserInput | UserPushTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserPushTokenUpdateManyWithWhereWithoutUserInput | UserPushTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserPushTokenScalarWhereInput | UserPushTokenScalarWhereInput[]
  }

  export type NotificationUpdateManyWithoutUserNestedInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutUserInput | NotificationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutUserInput | NotificationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutUserInput | NotificationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type UserModuleUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserModuleCreateWithoutUserInput, UserModuleUncheckedCreateWithoutUserInput> | UserModuleCreateWithoutUserInput[] | UserModuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserModuleCreateOrConnectWithoutUserInput | UserModuleCreateOrConnectWithoutUserInput[]
    upsert?: UserModuleUpsertWithWhereUniqueWithoutUserInput | UserModuleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserModuleCreateManyUserInputEnvelope
    set?: UserModuleWhereUniqueInput | UserModuleWhereUniqueInput[]
    disconnect?: UserModuleWhereUniqueInput | UserModuleWhereUniqueInput[]
    delete?: UserModuleWhereUniqueInput | UserModuleWhereUniqueInput[]
    connect?: UserModuleWhereUniqueInput | UserModuleWhereUniqueInput[]
    update?: UserModuleUpdateWithWhereUniqueWithoutUserInput | UserModuleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserModuleUpdateManyWithWhereWithoutUserInput | UserModuleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserModuleScalarWhereInput | UserModuleScalarWhereInput[]
  }

  export type UserCashbackConfigUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserCashbackConfigCreateWithoutUserInput, UserCashbackConfigUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserCashbackConfigCreateOrConnectWithoutUserInput
    upsert?: UserCashbackConfigUpsertWithoutUserInput
    disconnect?: UserCashbackConfigWhereInput | boolean
    delete?: UserCashbackConfigWhereInput | boolean
    connect?: UserCashbackConfigWhereUniqueInput
    update?: XOR<XOR<UserCashbackConfigUpdateToOneWithWhereWithoutUserInput, UserCashbackConfigUpdateWithoutUserInput>, UserCashbackConfigUncheckedUpdateWithoutUserInput>
  }

  export type ProductUncheckedUpdateManyWithoutMerchantNestedInput = {
    create?: XOR<ProductCreateWithoutMerchantInput, ProductUncheckedCreateWithoutMerchantInput> | ProductCreateWithoutMerchantInput[] | ProductUncheckedCreateWithoutMerchantInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutMerchantInput | ProductCreateOrConnectWithoutMerchantInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutMerchantInput | ProductUpsertWithWhereUniqueWithoutMerchantInput[]
    createMany?: ProductCreateManyMerchantInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutMerchantInput | ProductUpdateWithWhereUniqueWithoutMerchantInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutMerchantInput | ProductUpdateManyWithWhereWithoutMerchantInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type PurchaseUncheckedUpdateManyWithoutConsumerNestedInput = {
    create?: XOR<PurchaseCreateWithoutConsumerInput, PurchaseUncheckedCreateWithoutConsumerInput> | PurchaseCreateWithoutConsumerInput[] | PurchaseUncheckedCreateWithoutConsumerInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutConsumerInput | PurchaseCreateOrConnectWithoutConsumerInput[]
    upsert?: PurchaseUpsertWithWhereUniqueWithoutConsumerInput | PurchaseUpsertWithWhereUniqueWithoutConsumerInput[]
    createMany?: PurchaseCreateManyConsumerInputEnvelope
    set?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    disconnect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    delete?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    update?: PurchaseUpdateWithWhereUniqueWithoutConsumerInput | PurchaseUpdateWithWhereUniqueWithoutConsumerInput[]
    updateMany?: PurchaseUpdateManyWithWhereWithoutConsumerInput | PurchaseUpdateManyWithWhereWithoutConsumerInput[]
    deleteMany?: PurchaseScalarWhereInput | PurchaseScalarWhereInput[]
  }

  export type PurchaseUncheckedUpdateManyWithoutMerchantNestedInput = {
    create?: XOR<PurchaseCreateWithoutMerchantInput, PurchaseUncheckedCreateWithoutMerchantInput> | PurchaseCreateWithoutMerchantInput[] | PurchaseUncheckedCreateWithoutMerchantInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutMerchantInput | PurchaseCreateOrConnectWithoutMerchantInput[]
    upsert?: PurchaseUpsertWithWhereUniqueWithoutMerchantInput | PurchaseUpsertWithWhereUniqueWithoutMerchantInput[]
    createMany?: PurchaseCreateManyMerchantInputEnvelope
    set?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    disconnect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    delete?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    update?: PurchaseUpdateWithWhereUniqueWithoutMerchantInput | PurchaseUpdateWithWhereUniqueWithoutMerchantInput[]
    updateMany?: PurchaseUpdateManyWithWhereWithoutMerchantInput | PurchaseUpdateManyWithWhereWithoutMerchantInput[]
    deleteMany?: PurchaseScalarWhereInput | PurchaseScalarWhereInput[]
  }

  export type UserPushTokenUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserPushTokenCreateWithoutUserInput, UserPushTokenUncheckedCreateWithoutUserInput> | UserPushTokenCreateWithoutUserInput[] | UserPushTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPushTokenCreateOrConnectWithoutUserInput | UserPushTokenCreateOrConnectWithoutUserInput[]
    upsert?: UserPushTokenUpsertWithWhereUniqueWithoutUserInput | UserPushTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserPushTokenCreateManyUserInputEnvelope
    set?: UserPushTokenWhereUniqueInput | UserPushTokenWhereUniqueInput[]
    disconnect?: UserPushTokenWhereUniqueInput | UserPushTokenWhereUniqueInput[]
    delete?: UserPushTokenWhereUniqueInput | UserPushTokenWhereUniqueInput[]
    connect?: UserPushTokenWhereUniqueInput | UserPushTokenWhereUniqueInput[]
    update?: UserPushTokenUpdateWithWhereUniqueWithoutUserInput | UserPushTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserPushTokenUpdateManyWithWhereWithoutUserInput | UserPushTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserPushTokenScalarWhereInput | UserPushTokenScalarWhereInput[]
  }

  export type NotificationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput> | NotificationCreateWithoutUserInput[] | NotificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutUserInput | NotificationCreateOrConnectWithoutUserInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutUserInput | NotificationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: NotificationCreateManyUserInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutUserInput | NotificationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutUserInput | NotificationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type UserModuleUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserModuleCreateWithoutUserInput, UserModuleUncheckedCreateWithoutUserInput> | UserModuleCreateWithoutUserInput[] | UserModuleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserModuleCreateOrConnectWithoutUserInput | UserModuleCreateOrConnectWithoutUserInput[]
    upsert?: UserModuleUpsertWithWhereUniqueWithoutUserInput | UserModuleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserModuleCreateManyUserInputEnvelope
    set?: UserModuleWhereUniqueInput | UserModuleWhereUniqueInput[]
    disconnect?: UserModuleWhereUniqueInput | UserModuleWhereUniqueInput[]
    delete?: UserModuleWhereUniqueInput | UserModuleWhereUniqueInput[]
    connect?: UserModuleWhereUniqueInput | UserModuleWhereUniqueInput[]
    update?: UserModuleUpdateWithWhereUniqueWithoutUserInput | UserModuleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserModuleUpdateManyWithWhereWithoutUserInput | UserModuleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserModuleScalarWhereInput | UserModuleScalarWhereInput[]
  }

  export type UserCashbackConfigUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserCashbackConfigCreateWithoutUserInput, UserCashbackConfigUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserCashbackConfigCreateOrConnectWithoutUserInput
    upsert?: UserCashbackConfigUpsertWithoutUserInput
    disconnect?: UserCashbackConfigWhereInput | boolean
    delete?: UserCashbackConfigWhereInput | boolean
    connect?: UserCashbackConfigWhereUniqueInput
    update?: XOR<XOR<UserCashbackConfigUpdateToOneWithWhereWithoutUserInput, UserCashbackConfigUpdateWithoutUserInput>, UserCashbackConfigUncheckedUpdateWithoutUserInput>
  }

  export type UserCreateNestedOneWithoutUserModulesInput = {
    create?: XOR<UserCreateWithoutUserModulesInput, UserUncheckedCreateWithoutUserModulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserModulesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutUserModulesNestedInput = {
    create?: XOR<UserCreateWithoutUserModulesInput, UserUncheckedCreateWithoutUserModulesInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserModulesInput
    upsert?: UserUpsertWithoutUserModulesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUserModulesInput, UserUpdateWithoutUserModulesInput>, UserUncheckedUpdateWithoutUserModulesInput>
  }

  export type UserCreateNestedOneWithoutCashbackConfigInput = {
    create?: XOR<UserCreateWithoutCashbackConfigInput, UserUncheckedCreateWithoutCashbackConfigInput>
    connectOrCreate?: UserCreateOrConnectWithoutCashbackConfigInput
    connect?: UserWhereUniqueInput
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type UserUpdateOneRequiredWithoutCashbackConfigNestedInput = {
    create?: XOR<UserCreateWithoutCashbackConfigInput, UserUncheckedCreateWithoutCashbackConfigInput>
    connectOrCreate?: UserCreateOrConnectWithoutCashbackConfigInput
    upsert?: UserUpsertWithoutCashbackConfigInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCashbackConfigInput, UserUpdateWithoutCashbackConfigInput>, UserUncheckedUpdateWithoutCashbackConfigInput>
  }

  export type UserCreateNestedOneWithoutPushTokensInput = {
    create?: XOR<UserCreateWithoutPushTokensInput, UserUncheckedCreateWithoutPushTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutPushTokensInput
    connect?: UserWhereUniqueInput
  }

  export type EnumPlatformFieldUpdateOperationsInput = {
    set?: $Enums.Platform
  }

  export type UserUpdateOneRequiredWithoutPushTokensNestedInput = {
    create?: XOR<UserCreateWithoutPushTokensInput, UserUncheckedCreateWithoutPushTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutPushTokensInput
    upsert?: UserUpsertWithoutPushTokensInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPushTokensInput, UserUpdateWithoutPushTokensInput>, UserUncheckedUpdateWithoutPushTokensInput>
  }

  export type UserCreateNestedOneWithoutProductsInput = {
    create?: XOR<UserCreateWithoutProductsInput, UserUncheckedCreateWithoutProductsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProductsInput
    connect?: UserWhereUniqueInput
  }

  export type PurchaseCreateNestedManyWithoutProductInput = {
    create?: XOR<PurchaseCreateWithoutProductInput, PurchaseUncheckedCreateWithoutProductInput> | PurchaseCreateWithoutProductInput[] | PurchaseUncheckedCreateWithoutProductInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutProductInput | PurchaseCreateOrConnectWithoutProductInput[]
    createMany?: PurchaseCreateManyProductInputEnvelope
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
  }

  export type PurchaseUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<PurchaseCreateWithoutProductInput, PurchaseUncheckedCreateWithoutProductInput> | PurchaseCreateWithoutProductInput[] | PurchaseUncheckedCreateWithoutProductInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutProductInput | PurchaseCreateOrConnectWithoutProductInput[]
    createMany?: PurchaseCreateManyProductInputEnvelope
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutProductsNestedInput = {
    create?: XOR<UserCreateWithoutProductsInput, UserUncheckedCreateWithoutProductsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProductsInput
    upsert?: UserUpsertWithoutProductsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProductsInput, UserUpdateWithoutProductsInput>, UserUncheckedUpdateWithoutProductsInput>
  }

  export type PurchaseUpdateManyWithoutProductNestedInput = {
    create?: XOR<PurchaseCreateWithoutProductInput, PurchaseUncheckedCreateWithoutProductInput> | PurchaseCreateWithoutProductInput[] | PurchaseUncheckedCreateWithoutProductInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutProductInput | PurchaseCreateOrConnectWithoutProductInput[]
    upsert?: PurchaseUpsertWithWhereUniqueWithoutProductInput | PurchaseUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: PurchaseCreateManyProductInputEnvelope
    set?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    disconnect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    delete?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    update?: PurchaseUpdateWithWhereUniqueWithoutProductInput | PurchaseUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: PurchaseUpdateManyWithWhereWithoutProductInput | PurchaseUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: PurchaseScalarWhereInput | PurchaseScalarWhereInput[]
  }

  export type PurchaseUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<PurchaseCreateWithoutProductInput, PurchaseUncheckedCreateWithoutProductInput> | PurchaseCreateWithoutProductInput[] | PurchaseUncheckedCreateWithoutProductInput[]
    connectOrCreate?: PurchaseCreateOrConnectWithoutProductInput | PurchaseCreateOrConnectWithoutProductInput[]
    upsert?: PurchaseUpsertWithWhereUniqueWithoutProductInput | PurchaseUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: PurchaseCreateManyProductInputEnvelope
    set?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    disconnect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    delete?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    connect?: PurchaseWhereUniqueInput | PurchaseWhereUniqueInput[]
    update?: PurchaseUpdateWithWhereUniqueWithoutProductInput | PurchaseUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: PurchaseUpdateManyWithWhereWithoutProductInput | PurchaseUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: PurchaseScalarWhereInput | PurchaseScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutPurchasesInput = {
    create?: XOR<UserCreateWithoutPurchasesInput, UserUncheckedCreateWithoutPurchasesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPurchasesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutSalesInput = {
    create?: XOR<UserCreateWithoutSalesInput, UserUncheckedCreateWithoutSalesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSalesInput
    connect?: UserWhereUniqueInput
  }

  export type ProductCreateNestedOneWithoutPurchasesInput = {
    create?: XOR<ProductCreateWithoutPurchasesInput, ProductUncheckedCreateWithoutPurchasesInput>
    connectOrCreate?: ProductCreateOrConnectWithoutPurchasesInput
    connect?: ProductWhereUniqueInput
  }

  export type EnumPurchaseStatusFieldUpdateOperationsInput = {
    set?: $Enums.PurchaseStatus
  }

  export type UserUpdateOneRequiredWithoutPurchasesNestedInput = {
    create?: XOR<UserCreateWithoutPurchasesInput, UserUncheckedCreateWithoutPurchasesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPurchasesInput
    upsert?: UserUpsertWithoutPurchasesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPurchasesInput, UserUpdateWithoutPurchasesInput>, UserUncheckedUpdateWithoutPurchasesInput>
  }

  export type UserUpdateOneRequiredWithoutSalesNestedInput = {
    create?: XOR<UserCreateWithoutSalesInput, UserUncheckedCreateWithoutSalesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSalesInput
    upsert?: UserUpsertWithoutSalesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSalesInput, UserUpdateWithoutSalesInput>, UserUncheckedUpdateWithoutSalesInput>
  }

  export type ProductUpdateOneRequiredWithoutPurchasesNestedInput = {
    create?: XOR<ProductCreateWithoutPurchasesInput, ProductUncheckedCreateWithoutPurchasesInput>
    connectOrCreate?: ProductCreateOrConnectWithoutPurchasesInput
    upsert?: ProductUpsertWithoutPurchasesInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutPurchasesInput, ProductUpdateWithoutPurchasesInput>, ProductUncheckedUpdateWithoutPurchasesInput>
  }

  export type EnumCampaignTypeFieldUpdateOperationsInput = {
    set?: $Enums.CampaignType
  }

  export type EnumCampaignStatusFieldUpdateOperationsInput = {
    set?: $Enums.CampaignStatus
  }

  export type UserCreateNestedOneWithoutNotificationsInput = {
    create?: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutNotificationsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumNotificationTypeFieldUpdateOperationsInput = {
    set?: $Enums.NotificationType
  }

  export type UserUpdateOneRequiredWithoutNotificationsNestedInput = {
    create?: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutNotificationsInput
    upsert?: UserUpsertWithoutNotificationsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutNotificationsInput, UserUpdateWithoutNotificationsInput>, UserUncheckedUpdateWithoutNotificationsInput>
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

  export type NestedEnumUserTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeFilter<$PrismaModel> | $Enums.UserType
  }

  export type NestedEnumMerchantStatusNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.MerchantStatus | EnumMerchantStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.MerchantStatus[] | ListEnumMerchantStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MerchantStatus[] | ListEnumMerchantStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMerchantStatusNullableFilter<$PrismaModel> | $Enums.MerchantStatus | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumAccountStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountStatusFilter<$PrismaModel> | $Enums.AccountStatus
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

  export type NestedEnumUserTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeWithAggregatesFilter<$PrismaModel> | $Enums.UserType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserTypeFilter<$PrismaModel>
    _max?: NestedEnumUserTypeFilter<$PrismaModel>
  }

  export type NestedEnumMerchantStatusNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MerchantStatus | EnumMerchantStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.MerchantStatus[] | ListEnumMerchantStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.MerchantStatus[] | ListEnumMerchantStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumMerchantStatusNullableWithAggregatesFilter<$PrismaModel> | $Enums.MerchantStatus | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumMerchantStatusNullableFilter<$PrismaModel>
    _max?: NestedEnumMerchantStatusNullableFilter<$PrismaModel>
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumAccountStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountStatusWithAggregatesFilter<$PrismaModel> | $Enums.AccountStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAccountStatusFilter<$PrismaModel>
    _max?: NestedEnumAccountStatusFilter<$PrismaModel>
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

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
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

  export type NestedEnumPlatformFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformFilter<$PrismaModel> | $Enums.Platform
  }

  export type NestedEnumPlatformWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformWithAggregatesFilter<$PrismaModel> | $Enums.Platform
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlatformFilter<$PrismaModel>
    _max?: NestedEnumPlatformFilter<$PrismaModel>
  }

  export type NestedEnumPurchaseStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PurchaseStatus | EnumPurchaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PurchaseStatus[] | ListEnumPurchaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PurchaseStatus[] | ListEnumPurchaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPurchaseStatusFilter<$PrismaModel> | $Enums.PurchaseStatus
  }

  export type NestedEnumPurchaseStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PurchaseStatus | EnumPurchaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PurchaseStatus[] | ListEnumPurchaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PurchaseStatus[] | ListEnumPurchaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPurchaseStatusWithAggregatesFilter<$PrismaModel> | $Enums.PurchaseStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPurchaseStatusFilter<$PrismaModel>
    _max?: NestedEnumPurchaseStatusFilter<$PrismaModel>
  }

  export type NestedEnumCampaignTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignType | EnumCampaignTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignType[] | ListEnumCampaignTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignType[] | ListEnumCampaignTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignTypeFilter<$PrismaModel> | $Enums.CampaignType
  }

  export type NestedEnumCampaignStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignStatus | EnumCampaignStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignStatusFilter<$PrismaModel> | $Enums.CampaignStatus
  }

  export type NestedEnumCampaignTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignType | EnumCampaignTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignType[] | ListEnumCampaignTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignType[] | ListEnumCampaignTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignTypeWithAggregatesFilter<$PrismaModel> | $Enums.CampaignType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCampaignTypeFilter<$PrismaModel>
    _max?: NestedEnumCampaignTypeFilter<$PrismaModel>
  }

  export type NestedEnumCampaignStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CampaignStatus | EnumCampaignStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CampaignStatus[] | ListEnumCampaignStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCampaignStatusWithAggregatesFilter<$PrismaModel> | $Enums.CampaignStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCampaignStatusFilter<$PrismaModel>
    _max?: NestedEnumCampaignStatusFilter<$PrismaModel>
  }

  export type NestedEnumNotificationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeFilter<$PrismaModel> | $Enums.NotificationType
  }

  export type NestedEnumNotificationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeWithAggregatesFilter<$PrismaModel> | $Enums.NotificationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNotificationTypeFilter<$PrismaModel>
    _max?: NestedEnumNotificationTypeFilter<$PrismaModel>
  }

  export type ProductCreateWithoutMerchantInput = {
    id?: string
    name: string
    description: string
    price: Decimal | DecimalJsLike | number | string
    cashbackPercentage: Decimal | DecimalJsLike | number | string
    imageUrl?: string | null
    category?: string | null
    stock?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    purchases?: PurchaseCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutMerchantInput = {
    id?: string
    name: string
    description: string
    price: Decimal | DecimalJsLike | number | string
    cashbackPercentage: Decimal | DecimalJsLike | number | string
    imageUrl?: string | null
    category?: string | null
    stock?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    purchases?: PurchaseUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutMerchantInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutMerchantInput, ProductUncheckedCreateWithoutMerchantInput>
  }

  export type ProductCreateManyMerchantInputEnvelope = {
    data: ProductCreateManyMerchantInput | ProductCreateManyMerchantInput[]
    skipDuplicates?: boolean
  }

  export type PurchaseCreateWithoutConsumerInput = {
    id?: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
    merchant: UserCreateNestedOneWithoutSalesInput
    product: ProductCreateNestedOneWithoutPurchasesInput
  }

  export type PurchaseUncheckedCreateWithoutConsumerInput = {
    id?: string
    merchantId: string
    productId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type PurchaseCreateOrConnectWithoutConsumerInput = {
    where: PurchaseWhereUniqueInput
    create: XOR<PurchaseCreateWithoutConsumerInput, PurchaseUncheckedCreateWithoutConsumerInput>
  }

  export type PurchaseCreateManyConsumerInputEnvelope = {
    data: PurchaseCreateManyConsumerInput | PurchaseCreateManyConsumerInput[]
    skipDuplicates?: boolean
  }

  export type PurchaseCreateWithoutMerchantInput = {
    id?: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
    consumer: UserCreateNestedOneWithoutPurchasesInput
    product: ProductCreateNestedOneWithoutPurchasesInput
  }

  export type PurchaseUncheckedCreateWithoutMerchantInput = {
    id?: string
    consumerId: string
    productId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type PurchaseCreateOrConnectWithoutMerchantInput = {
    where: PurchaseWhereUniqueInput
    create: XOR<PurchaseCreateWithoutMerchantInput, PurchaseUncheckedCreateWithoutMerchantInput>
  }

  export type PurchaseCreateManyMerchantInputEnvelope = {
    data: PurchaseCreateManyMerchantInput | PurchaseCreateManyMerchantInput[]
    skipDuplicates?: boolean
  }

  export type UserPushTokenCreateWithoutUserInput = {
    id?: string
    token: string
    platform: $Enums.Platform
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserPushTokenUncheckedCreateWithoutUserInput = {
    id?: string
    token: string
    platform: $Enums.Platform
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserPushTokenCreateOrConnectWithoutUserInput = {
    where: UserPushTokenWhereUniqueInput
    create: XOR<UserPushTokenCreateWithoutUserInput, UserPushTokenUncheckedCreateWithoutUserInput>
  }

  export type UserPushTokenCreateManyUserInputEnvelope = {
    data: UserPushTokenCreateManyUserInput | UserPushTokenCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type NotificationCreateWithoutUserInput = {
    id?: string
    type: $Enums.NotificationType
    title: string
    message: string
    isRead?: boolean
    readAt?: Date | string | null
    actionUrl?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type NotificationUncheckedCreateWithoutUserInput = {
    id?: string
    type: $Enums.NotificationType
    title: string
    message: string
    isRead?: boolean
    readAt?: Date | string | null
    actionUrl?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type NotificationCreateOrConnectWithoutUserInput = {
    where: NotificationWhereUniqueInput
    create: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput>
  }

  export type NotificationCreateManyUserInputEnvelope = {
    data: NotificationCreateManyUserInput | NotificationCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserModuleCreateWithoutUserInput = {
    id?: string
    moduleKey: string
    isEnabled: boolean
    reason?: string | null
    enabledBy?: string | null
    disabledBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserModuleUncheckedCreateWithoutUserInput = {
    id?: string
    moduleKey: string
    isEnabled: boolean
    reason?: string | null
    enabledBy?: string | null
    disabledBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserModuleCreateOrConnectWithoutUserInput = {
    where: UserModuleWhereUniqueInput
    create: XOR<UserModuleCreateWithoutUserInput, UserModuleUncheckedCreateWithoutUserInput>
  }

  export type UserModuleCreateManyUserInputEnvelope = {
    data: UserModuleCreateManyUserInput | UserModuleCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserCashbackConfigCreateWithoutUserInput = {
    id?: string
    consumerPercent: Decimal | DecimalJsLike | number | string
    clubPercent: Decimal | DecimalJsLike | number | string
    consumerReferrerPercent: Decimal | DecimalJsLike | number | string
    merchantReferrerPercent: Decimal | DecimalJsLike | number | string
    reason?: string | null
    configuredBy?: string | null
    configuredAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCashbackConfigUncheckedCreateWithoutUserInput = {
    id?: string
    consumerPercent: Decimal | DecimalJsLike | number | string
    clubPercent: Decimal | DecimalJsLike | number | string
    consumerReferrerPercent: Decimal | DecimalJsLike | number | string
    merchantReferrerPercent: Decimal | DecimalJsLike | number | string
    reason?: string | null
    configuredBy?: string | null
    configuredAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCashbackConfigCreateOrConnectWithoutUserInput = {
    where: UserCashbackConfigWhereUniqueInput
    create: XOR<UserCashbackConfigCreateWithoutUserInput, UserCashbackConfigUncheckedCreateWithoutUserInput>
  }

  export type ProductUpsertWithWhereUniqueWithoutMerchantInput = {
    where: ProductWhereUniqueInput
    update: XOR<ProductUpdateWithoutMerchantInput, ProductUncheckedUpdateWithoutMerchantInput>
    create: XOR<ProductCreateWithoutMerchantInput, ProductUncheckedCreateWithoutMerchantInput>
  }

  export type ProductUpdateWithWhereUniqueWithoutMerchantInput = {
    where: ProductWhereUniqueInput
    data: XOR<ProductUpdateWithoutMerchantInput, ProductUncheckedUpdateWithoutMerchantInput>
  }

  export type ProductUpdateManyWithWhereWithoutMerchantInput = {
    where: ProductScalarWhereInput
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyWithoutMerchantInput>
  }

  export type ProductScalarWhereInput = {
    AND?: ProductScalarWhereInput | ProductScalarWhereInput[]
    OR?: ProductScalarWhereInput[]
    NOT?: ProductScalarWhereInput | ProductScalarWhereInput[]
    id?: UuidFilter<"Product"> | string
    merchantId?: UuidFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringFilter<"Product"> | string
    price?: DecimalFilter<"Product"> | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFilter<"Product"> | Decimal | DecimalJsLike | number | string
    imageUrl?: StringNullableFilter<"Product"> | string | null
    category?: StringNullableFilter<"Product"> | string | null
    stock?: IntFilter<"Product"> | number
    isActive?: BoolFilter<"Product"> | boolean
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
  }

  export type PurchaseUpsertWithWhereUniqueWithoutConsumerInput = {
    where: PurchaseWhereUniqueInput
    update: XOR<PurchaseUpdateWithoutConsumerInput, PurchaseUncheckedUpdateWithoutConsumerInput>
    create: XOR<PurchaseCreateWithoutConsumerInput, PurchaseUncheckedCreateWithoutConsumerInput>
  }

  export type PurchaseUpdateWithWhereUniqueWithoutConsumerInput = {
    where: PurchaseWhereUniqueInput
    data: XOR<PurchaseUpdateWithoutConsumerInput, PurchaseUncheckedUpdateWithoutConsumerInput>
  }

  export type PurchaseUpdateManyWithWhereWithoutConsumerInput = {
    where: PurchaseScalarWhereInput
    data: XOR<PurchaseUpdateManyMutationInput, PurchaseUncheckedUpdateManyWithoutConsumerInput>
  }

  export type PurchaseScalarWhereInput = {
    AND?: PurchaseScalarWhereInput | PurchaseScalarWhereInput[]
    OR?: PurchaseScalarWhereInput[]
    NOT?: PurchaseScalarWhereInput | PurchaseScalarWhereInput[]
    id?: UuidFilter<"Purchase"> | string
    consumerId?: UuidFilter<"Purchase"> | string
    merchantId?: UuidFilter<"Purchase"> | string
    productId?: UuidFilter<"Purchase"> | string
    totalAmount?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFilter<"Purchase"> | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFilter<"Purchase"> | $Enums.PurchaseStatus
    txHash?: StringNullableFilter<"Purchase"> | string | null
    createdAt?: DateTimeFilter<"Purchase"> | Date | string
    completedAt?: DateTimeNullableFilter<"Purchase"> | Date | string | null
  }

  export type PurchaseUpsertWithWhereUniqueWithoutMerchantInput = {
    where: PurchaseWhereUniqueInput
    update: XOR<PurchaseUpdateWithoutMerchantInput, PurchaseUncheckedUpdateWithoutMerchantInput>
    create: XOR<PurchaseCreateWithoutMerchantInput, PurchaseUncheckedCreateWithoutMerchantInput>
  }

  export type PurchaseUpdateWithWhereUniqueWithoutMerchantInput = {
    where: PurchaseWhereUniqueInput
    data: XOR<PurchaseUpdateWithoutMerchantInput, PurchaseUncheckedUpdateWithoutMerchantInput>
  }

  export type PurchaseUpdateManyWithWhereWithoutMerchantInput = {
    where: PurchaseScalarWhereInput
    data: XOR<PurchaseUpdateManyMutationInput, PurchaseUncheckedUpdateManyWithoutMerchantInput>
  }

  export type UserPushTokenUpsertWithWhereUniqueWithoutUserInput = {
    where: UserPushTokenWhereUniqueInput
    update: XOR<UserPushTokenUpdateWithoutUserInput, UserPushTokenUncheckedUpdateWithoutUserInput>
    create: XOR<UserPushTokenCreateWithoutUserInput, UserPushTokenUncheckedCreateWithoutUserInput>
  }

  export type UserPushTokenUpdateWithWhereUniqueWithoutUserInput = {
    where: UserPushTokenWhereUniqueInput
    data: XOR<UserPushTokenUpdateWithoutUserInput, UserPushTokenUncheckedUpdateWithoutUserInput>
  }

  export type UserPushTokenUpdateManyWithWhereWithoutUserInput = {
    where: UserPushTokenScalarWhereInput
    data: XOR<UserPushTokenUpdateManyMutationInput, UserPushTokenUncheckedUpdateManyWithoutUserInput>
  }

  export type UserPushTokenScalarWhereInput = {
    AND?: UserPushTokenScalarWhereInput | UserPushTokenScalarWhereInput[]
    OR?: UserPushTokenScalarWhereInput[]
    NOT?: UserPushTokenScalarWhereInput | UserPushTokenScalarWhereInput[]
    id?: UuidFilter<"UserPushToken"> | string
    userId?: UuidFilter<"UserPushToken"> | string
    token?: StringFilter<"UserPushToken"> | string
    platform?: EnumPlatformFilter<"UserPushToken"> | $Enums.Platform
    isActive?: BoolFilter<"UserPushToken"> | boolean
    createdAt?: DateTimeFilter<"UserPushToken"> | Date | string
    updatedAt?: DateTimeFilter<"UserPushToken"> | Date | string
  }

  export type NotificationUpsertWithWhereUniqueWithoutUserInput = {
    where: NotificationWhereUniqueInput
    update: XOR<NotificationUpdateWithoutUserInput, NotificationUncheckedUpdateWithoutUserInput>
    create: XOR<NotificationCreateWithoutUserInput, NotificationUncheckedCreateWithoutUserInput>
  }

  export type NotificationUpdateWithWhereUniqueWithoutUserInput = {
    where: NotificationWhereUniqueInput
    data: XOR<NotificationUpdateWithoutUserInput, NotificationUncheckedUpdateWithoutUserInput>
  }

  export type NotificationUpdateManyWithWhereWithoutUserInput = {
    where: NotificationScalarWhereInput
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyWithoutUserInput>
  }

  export type NotificationScalarWhereInput = {
    AND?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    OR?: NotificationScalarWhereInput[]
    NOT?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    id?: UuidFilter<"Notification"> | string
    userId?: UuidFilter<"Notification"> | string
    type?: EnumNotificationTypeFilter<"Notification"> | $Enums.NotificationType
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    readAt?: DateTimeNullableFilter<"Notification"> | Date | string | null
    actionUrl?: StringNullableFilter<"Notification"> | string | null
    metadata?: JsonNullableFilter<"Notification">
    createdAt?: DateTimeFilter<"Notification"> | Date | string
  }

  export type UserModuleUpsertWithWhereUniqueWithoutUserInput = {
    where: UserModuleWhereUniqueInput
    update: XOR<UserModuleUpdateWithoutUserInput, UserModuleUncheckedUpdateWithoutUserInput>
    create: XOR<UserModuleCreateWithoutUserInput, UserModuleUncheckedCreateWithoutUserInput>
  }

  export type UserModuleUpdateWithWhereUniqueWithoutUserInput = {
    where: UserModuleWhereUniqueInput
    data: XOR<UserModuleUpdateWithoutUserInput, UserModuleUncheckedUpdateWithoutUserInput>
  }

  export type UserModuleUpdateManyWithWhereWithoutUserInput = {
    where: UserModuleScalarWhereInput
    data: XOR<UserModuleUpdateManyMutationInput, UserModuleUncheckedUpdateManyWithoutUserInput>
  }

  export type UserModuleScalarWhereInput = {
    AND?: UserModuleScalarWhereInput | UserModuleScalarWhereInput[]
    OR?: UserModuleScalarWhereInput[]
    NOT?: UserModuleScalarWhereInput | UserModuleScalarWhereInput[]
    id?: UuidFilter<"UserModule"> | string
    userId?: UuidFilter<"UserModule"> | string
    moduleKey?: StringFilter<"UserModule"> | string
    isEnabled?: BoolFilter<"UserModule"> | boolean
    reason?: StringNullableFilter<"UserModule"> | string | null
    enabledBy?: UuidNullableFilter<"UserModule"> | string | null
    disabledBy?: UuidNullableFilter<"UserModule"> | string | null
    createdAt?: DateTimeFilter<"UserModule"> | Date | string
    updatedAt?: DateTimeFilter<"UserModule"> | Date | string
  }

  export type UserCashbackConfigUpsertWithoutUserInput = {
    update: XOR<UserCashbackConfigUpdateWithoutUserInput, UserCashbackConfigUncheckedUpdateWithoutUserInput>
    create: XOR<UserCashbackConfigCreateWithoutUserInput, UserCashbackConfigUncheckedCreateWithoutUserInput>
    where?: UserCashbackConfigWhereInput
  }

  export type UserCashbackConfigUpdateToOneWithWhereWithoutUserInput = {
    where?: UserCashbackConfigWhereInput
    data: XOR<UserCashbackConfigUpdateWithoutUserInput, UserCashbackConfigUncheckedUpdateWithoutUserInput>
  }

  export type UserCashbackConfigUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    configuredBy?: NullableStringFieldUpdateOperationsInput | string | null
    configuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCashbackConfigUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    clubPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerPercent?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    configuredBy?: NullableStringFieldUpdateOperationsInput | string | null
    configuredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutUserModulesInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseCreateNestedManyWithoutConsumerInput
    sales?: PurchaseCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenCreateNestedManyWithoutUserInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUserModulesInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseUncheckedCreateNestedManyWithoutConsumerInput
    sales?: PurchaseUncheckedCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenUncheckedCreateNestedManyWithoutUserInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUserModulesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUserModulesInput, UserUncheckedCreateWithoutUserModulesInput>
  }

  export type UserUpsertWithoutUserModulesInput = {
    update: XOR<UserUpdateWithoutUserModulesInput, UserUncheckedUpdateWithoutUserModulesInput>
    create: XOR<UserCreateWithoutUserModulesInput, UserUncheckedCreateWithoutUserModulesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUserModulesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUserModulesInput, UserUncheckedUpdateWithoutUserModulesInput>
  }

  export type UserUpdateWithoutUserModulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUpdateManyWithoutUserNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUserModulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUncheckedUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUncheckedUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUncheckedUpdateManyWithoutUserNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateWithoutCashbackConfigInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseCreateNestedManyWithoutConsumerInput
    sales?: PurchaseCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenCreateNestedManyWithoutUserInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    userModules?: UserModuleCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCashbackConfigInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseUncheckedCreateNestedManyWithoutConsumerInput
    sales?: PurchaseUncheckedCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenUncheckedCreateNestedManyWithoutUserInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    userModules?: UserModuleUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCashbackConfigInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCashbackConfigInput, UserUncheckedCreateWithoutCashbackConfigInput>
  }

  export type UserUpsertWithoutCashbackConfigInput = {
    update: XOR<UserUpdateWithoutCashbackConfigInput, UserUncheckedUpdateWithoutCashbackConfigInput>
    create: XOR<UserCreateWithoutCashbackConfigInput, UserUncheckedCreateWithoutCashbackConfigInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCashbackConfigInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCashbackConfigInput, UserUncheckedUpdateWithoutCashbackConfigInput>
  }

  export type UserUpdateWithoutCashbackConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUpdateManyWithoutUserNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCashbackConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUncheckedUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUncheckedUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUncheckedUpdateManyWithoutUserNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutPushTokensInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseCreateNestedManyWithoutConsumerInput
    sales?: PurchaseCreateNestedManyWithoutMerchantInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    userModules?: UserModuleCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPushTokensInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseUncheckedCreateNestedManyWithoutConsumerInput
    sales?: PurchaseUncheckedCreateNestedManyWithoutMerchantInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    userModules?: UserModuleUncheckedCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPushTokensInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPushTokensInput, UserUncheckedCreateWithoutPushTokensInput>
  }

  export type UserUpsertWithoutPushTokensInput = {
    update: XOR<UserUpdateWithoutPushTokensInput, UserUncheckedUpdateWithoutPushTokensInput>
    create: XOR<UserCreateWithoutPushTokensInput, UserUncheckedCreateWithoutPushTokensInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPushTokensInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPushTokensInput, UserUncheckedUpdateWithoutPushTokensInput>
  }

  export type UserUpdateWithoutPushTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUpdateManyWithoutMerchantNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPushTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUncheckedUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUncheckedUpdateManyWithoutMerchantNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUncheckedUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateWithoutProductsInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    purchases?: PurchaseCreateNestedManyWithoutConsumerInput
    sales?: PurchaseCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenCreateNestedManyWithoutUserInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    userModules?: UserModuleCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutProductsInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    purchases?: PurchaseUncheckedCreateNestedManyWithoutConsumerInput
    sales?: PurchaseUncheckedCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenUncheckedCreateNestedManyWithoutUserInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    userModules?: UserModuleUncheckedCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutProductsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProductsInput, UserUncheckedCreateWithoutProductsInput>
  }

  export type PurchaseCreateWithoutProductInput = {
    id?: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
    consumer: UserCreateNestedOneWithoutPurchasesInput
    merchant: UserCreateNestedOneWithoutSalesInput
  }

  export type PurchaseUncheckedCreateWithoutProductInput = {
    id?: string
    consumerId: string
    merchantId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type PurchaseCreateOrConnectWithoutProductInput = {
    where: PurchaseWhereUniqueInput
    create: XOR<PurchaseCreateWithoutProductInput, PurchaseUncheckedCreateWithoutProductInput>
  }

  export type PurchaseCreateManyProductInputEnvelope = {
    data: PurchaseCreateManyProductInput | PurchaseCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutProductsInput = {
    update: XOR<UserUpdateWithoutProductsInput, UserUncheckedUpdateWithoutProductsInput>
    create: XOR<UserCreateWithoutProductsInput, UserUncheckedCreateWithoutProductsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProductsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProductsInput, UserUncheckedUpdateWithoutProductsInput>
  }

  export type UserUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchases?: PurchaseUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUpdateManyWithoutUserNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchases?: PurchaseUncheckedUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUncheckedUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUncheckedUpdateManyWithoutUserNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUncheckedUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUncheckedUpdateOneWithoutUserNestedInput
  }

  export type PurchaseUpsertWithWhereUniqueWithoutProductInput = {
    where: PurchaseWhereUniqueInput
    update: XOR<PurchaseUpdateWithoutProductInput, PurchaseUncheckedUpdateWithoutProductInput>
    create: XOR<PurchaseCreateWithoutProductInput, PurchaseUncheckedCreateWithoutProductInput>
  }

  export type PurchaseUpdateWithWhereUniqueWithoutProductInput = {
    where: PurchaseWhereUniqueInput
    data: XOR<PurchaseUpdateWithoutProductInput, PurchaseUncheckedUpdateWithoutProductInput>
  }

  export type PurchaseUpdateManyWithWhereWithoutProductInput = {
    where: PurchaseScalarWhereInput
    data: XOR<PurchaseUpdateManyMutationInput, PurchaseUncheckedUpdateManyWithoutProductInput>
  }

  export type UserCreateWithoutPurchasesInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutMerchantInput
    sales?: PurchaseCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenCreateNestedManyWithoutUserInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    userModules?: UserModuleCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPurchasesInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutMerchantInput
    sales?: PurchaseUncheckedCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenUncheckedCreateNestedManyWithoutUserInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    userModules?: UserModuleUncheckedCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPurchasesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPurchasesInput, UserUncheckedCreateWithoutPurchasesInput>
  }

  export type UserCreateWithoutSalesInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseCreateNestedManyWithoutConsumerInput
    pushTokens?: UserPushTokenCreateNestedManyWithoutUserInput
    notifications?: NotificationCreateNestedManyWithoutUserInput
    userModules?: UserModuleCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSalesInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseUncheckedCreateNestedManyWithoutConsumerInput
    pushTokens?: UserPushTokenUncheckedCreateNestedManyWithoutUserInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutUserInput
    userModules?: UserModuleUncheckedCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSalesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSalesInput, UserUncheckedCreateWithoutSalesInput>
  }

  export type ProductCreateWithoutPurchasesInput = {
    id?: string
    name: string
    description: string
    price: Decimal | DecimalJsLike | number | string
    cashbackPercentage: Decimal | DecimalJsLike | number | string
    imageUrl?: string | null
    category?: string | null
    stock?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    merchant: UserCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateWithoutPurchasesInput = {
    id?: string
    merchantId: string
    name: string
    description: string
    price: Decimal | DecimalJsLike | number | string
    cashbackPercentage: Decimal | DecimalJsLike | number | string
    imageUrl?: string | null
    category?: string | null
    stock?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductCreateOrConnectWithoutPurchasesInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutPurchasesInput, ProductUncheckedCreateWithoutPurchasesInput>
  }

  export type UserUpsertWithoutPurchasesInput = {
    update: XOR<UserUpdateWithoutPurchasesInput, UserUncheckedUpdateWithoutPurchasesInput>
    create: XOR<UserCreateWithoutPurchasesInput, UserUncheckedCreateWithoutPurchasesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPurchasesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPurchasesInput, UserUncheckedUpdateWithoutPurchasesInput>
  }

  export type UserUpdateWithoutPurchasesInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutMerchantNestedInput
    sales?: PurchaseUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUpdateManyWithoutUserNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPurchasesInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutMerchantNestedInput
    sales?: PurchaseUncheckedUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUncheckedUpdateManyWithoutUserNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUncheckedUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserUpsertWithoutSalesInput = {
    update: XOR<UserUpdateWithoutSalesInput, UserUncheckedUpdateWithoutSalesInput>
    create: XOR<UserCreateWithoutSalesInput, UserUncheckedCreateWithoutSalesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSalesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSalesInput, UserUncheckedUpdateWithoutSalesInput>
  }

  export type UserUpdateWithoutSalesInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUpdateManyWithoutConsumerNestedInput
    pushTokens?: UserPushTokenUpdateManyWithoutUserNestedInput
    notifications?: NotificationUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSalesInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUncheckedUpdateManyWithoutConsumerNestedInput
    pushTokens?: UserPushTokenUncheckedUpdateManyWithoutUserNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUncheckedUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUncheckedUpdateOneWithoutUserNestedInput
  }

  export type ProductUpsertWithoutPurchasesInput = {
    update: XOR<ProductUpdateWithoutPurchasesInput, ProductUncheckedUpdateWithoutPurchasesInput>
    create: XOR<ProductCreateWithoutPurchasesInput, ProductUncheckedCreateWithoutPurchasesInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutPurchasesInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutPurchasesInput, ProductUncheckedUpdateWithoutPurchasesInput>
  }

  export type ProductUpdateWithoutPurchasesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    merchant?: UserUpdateOneRequiredWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutPurchasesInput = {
    id?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutNotificationsInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseCreateNestedManyWithoutConsumerInput
    sales?: PurchaseCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenCreateNestedManyWithoutUserInput
    userModules?: UserModuleCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutNotificationsInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    username: string
    cpf: string
    phone?: string | null
    birthDate?: Date | string | null
    password: string
    passwordChangedAt?: Date | string | null
    profilePicture?: string | null
    userType: $Enums.UserType
    merchantStatus?: $Enums.MerchantStatus | null
    publicKey?: string | null
    privateKey?: string | null
    referralId?: string | null
    referredBy?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    accountStatus?: $Enums.AccountStatus
    lastLoginAt?: Date | string | null
    emailConfirmed?: boolean
    failedLoginAttempts?: number
    lastFailedLoginAt?: Date | string | null
    isBlockedLoginAttempts?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutMerchantInput
    purchases?: PurchaseUncheckedCreateNestedManyWithoutConsumerInput
    sales?: PurchaseUncheckedCreateNestedManyWithoutMerchantInput
    pushTokens?: UserPushTokenUncheckedCreateNestedManyWithoutUserInput
    userModules?: UserModuleUncheckedCreateNestedManyWithoutUserInput
    cashbackConfig?: UserCashbackConfigUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutNotificationsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
  }

  export type UserUpsertWithoutNotificationsInput = {
    update: XOR<UserUpdateWithoutNotificationsInput, UserUncheckedUpdateWithoutNotificationsInput>
    create: XOR<UserCreateWithoutNotificationsInput, UserUncheckedCreateWithoutNotificationsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutNotificationsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutNotificationsInput, UserUncheckedUpdateWithoutNotificationsInput>
  }

  export type UserUpdateWithoutNotificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutNotificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordChangedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    merchantStatus?: NullableEnumMerchantStatusFieldUpdateOperationsInput | $Enums.MerchantStatus | null
    publicKey?: NullableStringFieldUpdateOperationsInput | string | null
    privateKey?: NullableStringFieldUpdateOperationsInput | string | null
    referralId?: NullableStringFieldUpdateOperationsInput | string | null
    referredBy?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailConfirmed?: BoolFieldUpdateOperationsInput | boolean
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lastFailedLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isBlockedLoginAttempts?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutMerchantNestedInput
    purchases?: PurchaseUncheckedUpdateManyWithoutConsumerNestedInput
    sales?: PurchaseUncheckedUpdateManyWithoutMerchantNestedInput
    pushTokens?: UserPushTokenUncheckedUpdateManyWithoutUserNestedInput
    userModules?: UserModuleUncheckedUpdateManyWithoutUserNestedInput
    cashbackConfig?: UserCashbackConfigUncheckedUpdateOneWithoutUserNestedInput
  }

  export type ProductCreateManyMerchantInput = {
    id?: string
    name: string
    description: string
    price: Decimal | DecimalJsLike | number | string
    cashbackPercentage: Decimal | DecimalJsLike | number | string
    imageUrl?: string | null
    category?: string | null
    stock?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseCreateManyConsumerInput = {
    id?: string
    merchantId: string
    productId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type PurchaseCreateManyMerchantInput = {
    id?: string
    consumerId: string
    productId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type UserPushTokenCreateManyUserInput = {
    id?: string
    token: string
    platform: $Enums.Platform
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationCreateManyUserInput = {
    id?: string
    type: $Enums.NotificationType
    title: string
    message: string
    isRead?: boolean
    readAt?: Date | string | null
    actionUrl?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type UserModuleCreateManyUserInput = {
    id?: string
    moduleKey: string
    isEnabled: boolean
    reason?: string | null
    enabledBy?: string | null
    disabledBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUpdateWithoutMerchantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchases?: PurchaseUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutMerchantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchases?: PurchaseUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateManyWithoutMerchantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cashbackPercentage?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseUpdateWithoutConsumerInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    merchant?: UserUpdateOneRequiredWithoutSalesNestedInput
    product?: ProductUpdateOneRequiredWithoutPurchasesNestedInput
  }

  export type PurchaseUncheckedUpdateWithoutConsumerInput = {
    id?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PurchaseUncheckedUpdateManyWithoutConsumerInput = {
    id?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PurchaseUpdateWithoutMerchantInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumer?: UserUpdateOneRequiredWithoutPurchasesNestedInput
    product?: ProductUpdateOneRequiredWithoutPurchasesNestedInput
  }

  export type PurchaseUncheckedUpdateWithoutMerchantInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PurchaseUncheckedUpdateManyWithoutMerchantInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserPushTokenUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPushTokenUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPushTokenUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    actionUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    actionUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    actionUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserModuleUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleKey?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    enabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    disabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserModuleUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleKey?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    enabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    disabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserModuleUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleKey?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    enabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    disabledBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseCreateManyProductInput = {
    id?: string
    consumerId: string
    merchantId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    merchantAmount: Decimal | DecimalJsLike | number | string
    consumerCashback: Decimal | DecimalJsLike | number | string
    platformFee: Decimal | DecimalJsLike | number | string
    consumerReferrerFee: Decimal | DecimalJsLike | number | string
    merchantReferrerFee: Decimal | DecimalJsLike | number | string
    status?: $Enums.PurchaseStatus
    txHash?: string | null
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type PurchaseUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumer?: UserUpdateOneRequiredWithoutPurchasesNestedInput
    merchant?: UserUpdateOneRequiredWithoutSalesNestedInput
  }

  export type PurchaseUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerId?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PurchaseUncheckedUpdateManyWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerId?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerCashback?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    platformFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    consumerReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    merchantReferrerFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPurchaseStatusFieldUpdateOperationsInput | $Enums.PurchaseStatus
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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