import pytest

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.schemas.schemas import UserCreate


def test_password_hash_and_verify():
    hashed = get_password_hash("Password123")
    assert hashed != "Password123"
    assert verify_password("Password123", hashed)
    assert not verify_password("Wrong123", hashed)


def test_access_token_round_trip():
    payload = decode_token(create_access_token({"sub": "a@example.com"}))
    assert payload["sub"] == "a@example.com"
    assert payload["type"] == "access"


def test_refresh_token_type():
    assert decode_token(create_refresh_token({"sub": "a@example.com"}))["type"] == "refresh"


def test_invalid_token_is_rejected():
    assert decode_token("not-a-token") is None


@pytest.mark.parametrize("password", ["password123", "PASSWORDabc", "Sh0rt"])
def test_weak_passwords_are_refused(password):
    with pytest.raises(ValueError):
        UserCreate(email="a@example.com", full_name="Ab", password=password)
