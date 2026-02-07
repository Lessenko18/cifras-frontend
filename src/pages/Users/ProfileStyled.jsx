import styled from "styled-components";

export const ProfileContainer = styled.section`
  max-width: 900px;
  width: 100%;
  margin: 40px auto;
  padding: 0 20px;
`;

export const Card = styled.form`
  background: var(--light);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 5px 15px -5px #00000060;
  display: grid;
  gap: 20px;
  border: 1px solid #000;

  .info {
    display: grid;
    gap: 12px;
  }

  .form {
    display: grid;
    gap: 16px;
  }

  .form > div {
    display: grid;
    gap: 8px;
  }

  .form input {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    background: #fff;

    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(59, 47, 235, 0.1);
    }

    &:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  input[type="file"] {
    padding: 6px 0;
  }
`;

export const Avatar = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;

  img {
    width: px;
    height: 96px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid #000;
  }

  .initials {
    width: 96px;
    height: 96px;
    border-radius: 10px;
    background: #111111;
    color: #fff;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 26px;
  }

  .meta strong {
    display: block;
    font-size: 18px;
  }

  .meta span {
    display: block;
    color: #666;
  }
`;

export const Field = styled.div`
  display: grid;
  gap: 6px;
  label {
    font-size: 13px;
    color: #333;
  }
  div {
    background: #fff;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  button {
    flex: 1;
    padding: 8px 20px !important;
    border-radius: 0.3em;
    max-width: none !important;
    border: none;
    color: #fff;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
