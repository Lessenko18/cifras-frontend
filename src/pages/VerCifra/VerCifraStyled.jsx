import styled from "styled-components";

export const VerCifraContainer = styled.section`
  max-width: 1200px;
  width: 100%;
  padding: 0 10px;
`;
export const CifraBody = styled.div``;
export const CifraContent = styled.div`
  display: grid;
  margin: 50px auto;
  justify-items: center;
  max-width: 850px;
  background: linear-gradient(to left, var(--dark), #1f1b64);
  color: #ffffff;
  border-radius: 10px;
  padding: 30px;
  gap: 40px;
  a {
    color: var(--main);
    text-decoration: underline;
    font-style: italic;
    margin-left: auto;
  }
  pre {
    font-size: 25px;
  }
`;
export const UpdateCifra = styled.form`
  display: grid;
  margin: 50px auto;
  justify-items: center;
  max-width: 850px;
  background-color: #f1f1f1;
  border-radius: 10px;
  padding: 30px;
  gap: 20px;
  textarea {
    padding: 20px;
    font-size: 18px;
  }
  div {
    max-width: 400px;
    width: 100%;
    label {
      font-size: 20px;
      font-weight: 600px;
    }
    input {
      width: 100%;
    }
  }
`;
export const ModalDelete = styled.div`
  background-color: var(--light);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: 300px;
  width: 100%;
  margin: 15px auto;
  text-align: center;
  border: 1px solid #000;
  display: grid;
  gap: 15px;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);

  div {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
`;
