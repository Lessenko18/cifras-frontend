import styled from "styled-components";

export const Background = styled.section`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  background-image: url("/backgroundLogin.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
  }
`;

export const LoginContainer = styled.div`
  position: relative;
  z-index: 2;

  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);

  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;

  padding: 40px 35px;
  width: 380px;

  color: #fff;
  text-align: center;

  .title-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 32px;

    .logo {
      width: 50px;
      height: 50px;
      object-fit: contain;
    }
  }

  h1 {
    font-size: 28px;
    margin: 0;
    font-weight: 600;
  }

  .input-field {
    position: relative;
    width: 100%;
    height: 50px;
    margin-bottom: 28px;
  }

  input {
    width: 100%;
    height: 100%;

    /* Padding ajustado: 45px nas laterais para dar espaço aos ícones */
    padding: 16px 45px;
    font-size: 16px;

    border-radius: 40px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.08);

    color: #fff;
    outline: none;

    transition: 0.2s;

    &:focus {
      border-color: #fff;
      background: rgba(255, 255, 255, 0.12);
    }

    &::placeholder {
      color: #e8e8e8;
    }

    /* Remove fundo branco do autocomplete do navegador */
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-background-clip: text;
      -webkit-text-fill-color: #fff;
      transition: background-color 5000s ease-in-out 0s;
      box-shadow: inset 0 0 20px 20px rgba(255, 255, 255, 0.08);
    }
  }

  .icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-left {
    left: 18px;
  }

  .icon-right {
    right: 18px;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      opacity: 1;
    }
  }

  .recall-forget {
    display: flex;
    justify-content: space-between;
    align-items: center;

    font-size: 14px;
    margin: -10px 0 25px 0;

    label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }

    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #fff;
    }

    a {
      color: #fff;
      text-decoration: none;
      opacity: 0.9;
      transition: 0.2s;

      &:hover {
        opacity: 1;
        text-decoration: underline;
      }
    }
  }

  button[type="submit"] {
    width: 100%;
    padding: 14px;

    border: none;
    border-radius: 40px;

    background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%);
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    font-weight: 600;

    transition: 0.25s;

    &:hover {
      background: linear-gradient(90deg, #7c3aed 0%, #2563eb 100%);
      transform: scale(1.02);
    }
  }

  .signup-link {
    margin-top: 25px;
    font-size: 15px;

    p {
      display: inline-block;
      margin-right: 6px;
    }

    a {
      color: #fff;
      font-weight: 600;
      text-decoration: none;
      opacity: 0.9;

      &:hover {
        opacity: 1;
        text-decoration: underline;
      }
    }
  }
`;
