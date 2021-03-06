import type { SpreeApiConfig, SpreeApiProvider } from '../index'
import type { GetProductOperation } from '@commerce/types/product'
import type {
  OperationContext,
  OperationOptions,
} from '@commerce/api/operations'
import type { IProduct } from '@spree/storefront-api-v2-sdk/types/interfaces/Product'
import type { SpreeSdkVariables } from 'framework/spree/types'
import MissingSlugVariableError from 'framework/spree/errors/MissingSlugVariableError'
import normalizeProduct from '../../utils/normalize-product'

export default function getProductOperation({
  commerce,
}: OperationContext<SpreeApiProvider>) {
  async function getProduct<T extends GetProductOperation>(opts: {
    variables: T['variables']
    config?: Partial<SpreeApiConfig>
    preview?: boolean
  }): Promise<T['data']>

  async function getProduct<T extends GetProductOperation>(
    opts: {
      variables: T['variables']
      config?: Partial<SpreeApiConfig>
      preview?: boolean
    } & OperationOptions
  ): Promise<T['data']>

  async function getProduct<T extends GetProductOperation>({
    query = '',
    variables: getProductVariables,
    config: userConfig,
  }: {
    query?: string
    variables?: T['variables']
    config?: Partial<SpreeApiConfig>
    preview?: boolean
  }): Promise<T['data']> {
    console.log(
      'getProduct called. Configuration: ',
      'getProductVariables: ',
      getProductVariables,
      'config: ',
      userConfig
    )

    if (!getProductVariables?.slug) {
      throw new MissingSlugVariableError()
    }

    const variables: SpreeSdkVariables = {
      methodPath: 'products.show',
      arguments: [
        getProductVariables.slug,
        {},
        {
          include:
            'primary_variant,variants,images,option_types,variants.option_values',
        },
      ],
    }

    const config = commerce.getConfig(userConfig)
    const { fetch: apiFetch } = config // TODO: Send config.locale to Spree.

    const { data: spreeSuccessResponse } = await apiFetch<
      IProduct,
      SpreeSdkVariables
    >('__UNUSED__', {
      variables,
    })

    return {
      product: normalizeProduct(
        spreeSuccessResponse,
        spreeSuccessResponse.data
      ),
    }
  }

  return getProduct
}
