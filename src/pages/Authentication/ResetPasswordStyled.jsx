import styled from "styled-components";

export const Background = styled.section`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  background-image: url("/caritas.jpg");
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

export const ResetContainer = styled.div`
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

  h1 {
    font-size: 28px;
    margin-bottom: 20px;
    font-weight: 600;
  }

  p {
    font-size: 14px;
    margin-bottom: 30px;
    opacity: 0.8;
    line-height: 1.4;
  }

  .input-field {
    position: relative;
    width: 100%;
    height: 50px;
    margin-bottom: 18px;
  }

  input {
    width: 100%;
    height: 100%;
    padding: 16px 45px;
    font-size: 16px;

    border-radius: 40px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    background: rgba(0, 0, 0, 0.25);

    color: #fff;
    outline: none;

    transition: 0.2s;

    &:focus {
      border-color: #fff;
      background: rgba(0, 0, 0, 0.35);
    }

    &::placeholder {
      color: #e8e8e8;
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

  button[type="submit"] {
    width: 100%;
    padding: 14px;
    margin-top: 10px;

    border: none;
    border-radius: 40px;

    background: #ffffff;
    color: #000;
    font-size: 16px;
    cursor: pointer;
    font-weight: 600;

    transition: 0.25s;

    &:disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }

    &:hover:enabled {
      background: #eaeaea;
    }
  }

  .back-link {
    margin-top: 25px;
    font-size: 15px;

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
