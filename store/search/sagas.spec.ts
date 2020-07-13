import * as Eff from 'redux-saga/effects'
import { executeSearchAddress, watchSearchAddress } from './sagas'
import { searchAddressAPI } from './api'
import { SagaSetting } from '../../constants'

import {
  Address,
  SearchAddressActionTypes,
  SearchAddressFailurePayload,
  SearchAddressActions,
  SearchAddressSuccessPayload,
  SearchAddressPayload,
} from './actions'

const call: any = Eff.call
const put: any = Eff.put
const debounce: any = Eff.debounce

describe('executeSearchAddress generator', () => {
  const searchInputPayloadAction = {
    payload: { input: '88' } as SearchAddressPayload,
  } as SearchAddressActionTypes

  let gen: Generator

  beforeEach(() => {
    gen = executeSearchAddress(searchInputPayloadAction)
  })

  describe('try', () => {
    it('test 2 effects', () => {
      expect(gen.next().value).toEqual(
        call(searchAddressAPI, searchInputPayloadAction.payload)
      )

      const addresses: Address[] = []

      const successPayload: SearchAddressSuccessPayload = {
        addresses,
      }
      expect(gen.next(addresses).value).toEqual(
        put({
          type: SearchAddressActions.searchAddressSuccess.toString(),
          payload: successPayload,
        })
      )
    })
  })

  describe('catch', () => {
    it('test 1 effect', () => {
      const e = { name: 'error', message: ' error' }
      gen.next()
      const failurePayload: SearchAddressFailurePayload = {
        error: e,
      }
      expect(gen.throw(e).value).toEqual(
        put({
          type: SearchAddressActions.searchAddressFailure.toString(),
          payload: failurePayload,
        })
      )
    })
  })
})

describe('watchSearchAddress', () => {
  let gen: Generator

  it('test 1 effect', () => {
    gen = watchSearchAddress()
    expect(gen.next().value).toEqual(
      debounce(
        SagaSetting.DEBOUNCE_INTERVAL,
        SearchAddressActions.searchAddress,
        executeSearchAddress
      )
    )
  })
})
