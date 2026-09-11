import styled from "styled-components";

export const NavContainer = styled.nav`
  width: 100%;
  margin: 0 0 20px;
  background-color: #050810;
  background-image: url("/navbar.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center 42%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0px;
  box-shadow: 0 8px 24px -12px rgba(0, 0, 0, 0.5);
  overflow: visible;

  #logo {
    max-width: 200px;
    filter: drop-shadow(0 2px 2px #0000007b);
  }

  @media only screen and (max-width: 600px) {
    #logo {
      max-width: 160px;
    }
  }
`;

export const NavInner = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 10px 20px;

  @media only screen and (max-width: 420px) {
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 8px 12px 10px;
  }
`;
export const NavContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 26px;
  color: #fff;
  align-items: center;
  padding: 14px 0;

  .nav-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    padding-bottom: 8px;
    transition: color 0.2s;

    svg {
      flex-shrink: 0;
    }

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: #fff;
      border-radius: 2px;
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &:hover {
      color: #fff;
    }

    &:hover::after {
      transform: scaleX(1);
    }

    &.active {
      color: #a78bfa;
    }

    &.active::after {
      transform: scaleX(1);
      background: linear-gradient(90deg, #c084fc, #7c3aed);
    }
  }

  @media only screen and (max-width: 600px) {
    font-size: 14px;
    gap: 16px;
  }

  @media only screen and (max-width: 528px) {
    padding-top: 0;
  }

  @media only screen and (max-width: 420px) {
    width: 100%;
    justify-content: center;
    gap: 8px;
    padding: 4px 0 0;
    font-size: 13px;
  }
`;

export const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.18);
    }
  }

  [data-theme="dark"] & .icon-btn.theme-toggle {
    background: rgba(251, 191, 36, 0.18);
    border-color: rgba(251, 191, 36, 0.5);
    color: #fbbf24;
  }

  @media only screen and (max-width: 420px) {
    gap: 8px;

    .icon-btn {
      width: 32px;
      height: 32px;
    }
  }
`;

export const UserArea = styled.div`
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;

  .perfil-btn {
    display: block;
    width: 100%;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--dark);
    text-decoration: none;
    font-weight: 600;
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease,
      transform 0.15s ease;

    &:hover {
      background-color: var(--gray);
      color: var(--main);
      border-color: var(--gray);
      transform: translateY(-1px);
    }
  }

  .user-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
  }

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  @media only screen and (max-width: 600px) {
    img {
      width: 36px;
      height: 36px;
    }
  }

  @media only screen and (max-width: 420px) {
    .user-btn {
      gap: 6px;
    }

    img {
      width: 32px;
      height: 32px;
    }

    .initials {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }
  }

  .initials {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .user-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--light);
    color: var(--dark);
    border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    padding: 12px;
    min-width: 290px;
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .user-info {
    display: flex;
    gap: 8px;
    align-items: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    padding-bottom: 8px;
    margin-bottom: 8px;
  }

  .user-info img {
    width: 56px;
    height: 56px;
  }

  .initials.big {
    width: 56px;
    height: 56px;
    font-size: 18px;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 14px;
    flex: 1;
    min-width: 0;
  }

  .meta span {
    overflow-wrap: anywhere;
  }

  .logout-btn {
    background: var(--main);
    color: var(--light);
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 4px;
  }
`;
