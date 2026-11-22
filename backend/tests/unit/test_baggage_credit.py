import pytest

from app.models.models import FlightType
from app.services import baggage_credit as bc


@pytest.mark.parametrize(
    "flight_type, multiplier",
    [
        (FlightType.DOMESTIC, 1.0),
        (FlightType.INTERNATIONAL, 1.5),
        (FlightType.TRANSATLANTIC, 2.0),
    ],
)
def test_flight_multiplier(flight_type, multiplier):
    assert bc.flight_multiplier(flight_type) == multiplier


def test_credit_uses_multiplier():
    assert bc.calculate_credit_value(FlightType.INTERNATIONAL, 5) == 7.5


def test_no_credit_when_bag_too_heavy():
    assert bc.calculate_credit_value(FlightType.TRANSATLANTIC, -3) == 0.0


def test_credit_for_flight():
    assert bc.credit_for_flight(FlightType.DOMESTIC, 23, 20.5) == (2.5, 2.5)


def test_credit_for_flight_rejects_negative_weight():
    with pytest.raises(ValueError):
        bc.credit_for_flight(FlightType.DOMESTIC, 23, -1)


def test_classify_transatlantic_flight():
    assert bc.classify_flight("cdg", "JFK") == (FlightType.TRANSATLANTIC, 32.0)


def test_classify_other_flight_is_international():
    assert bc.classify_flight("TUN", "CDG") == (FlightType.INTERNATIONAL, 23.0)


def test_classify_rejects_bad_code():
    with pytest.raises(ValueError):
        bc.classify_flight("PARIS", "CDG")


def test_service_fee():
    assert bc.service_fee(3) == 3.0


def test_check_debit_returns_new_balance():
    assert bc.check_debit(10, 4) == 6.0


@pytest.mark.parametrize("balance, amount", [(10, 0), (10, -1), (2, 5)])
def test_check_debit_refuses(balance, amount):
    with pytest.raises(ValueError):
        bc.check_debit(balance, amount)


def test_dashboard_estimates():
    assert bc.money_saved(2) == 80.0
    assert bc.carbon_reduced(10) == 5.0
