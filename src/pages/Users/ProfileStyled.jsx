import styled from "styled-components";

export const ProfileContainer = styled.section`
  max-width: 1400px;
  width: 100%;
  margin: 24px auto;
  padding: 0 20px;
`;

export const BackRow = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;

  button {
    max-width: fit-content;
  }
`;

export const Card = styled.form`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 5px 15px -5px #00000060;
  display: grid;
  gap: 20px;
  border: 1px solid var(--border-color);
  max-width: 900px;
  width: 100%;
  margin: 0 auto;

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

  .form label {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 600;
  }

  .form input {
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 14px;
    background: var(--bg-input);
    color: var(--text-primary);

    &::placeholder {
      color: var(--text-muted);
    }

    &:focus {
      outline: none;
      border-color: var(--main);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    &:disabled {
      background: var(--bg-input);
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
    width: 96px;
    height: 96px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid var(--border-color);
  }

  .initials {
    width: 96px;
    height: 96px;
    border-radius: 10px;
    background: var(--main);
    color: #fff;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 26px;
  }

  .meta strong {
    display: block;
    font-size: 18px;
    color: var(--text-primary);
  }

  .meta span {
    display: block;
    color: var(--text-muted);
  }
`;

export const Field = styled.div`
  display: grid;
  gap: 6px;
  label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }
  div {
    background: var(--bg-input);
    color: var(--text-primary);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
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
