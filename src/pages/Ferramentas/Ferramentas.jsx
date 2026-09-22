import { useEffect, useMemo, useRef, useState } from "react";
import { FiMic, FiMicOff, FiChevronDown } from "react-icons/fi";
import { useTuner } from "../../hooks/useTuner";
import {
  Page,
  CardsStack,
  Card,
  TunerToggle,
  TunerControls,
  DeviceMenuButton,
  DeviceMenu,
  DeviceOption,
  TunerError,
  TunerDisplay,
  Gauge,
  GaugeTrack,
  GaugeNeedle,
} from "./FerramentasStyled";

export default function Ferramentas() {
  const { listening, error, note, pitch, devices, deviceId, setDeviceId, toggle } = useTuner();
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const deviceMenuRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (deviceMenuRef.current && !deviceMenuRef.current.contains(e.target)) {
        setDeviceMenuOpen(false);
      }
    }
    if (deviceMenuOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [deviceMenuOpen]);

  const status = useMemo(() => {
    if (!note) return null;
    const abs = Math.abs(note.cents);
    if (abs <= 5) return "in-tune";
    if (abs <= 15) return "close";
    return "off";
  }, [note]);

  const needlePercent = useMemo(() => {
    if (!note) return 50;
    const clamped = Math.max(-50, Math.min(50, note.cents));
    return 50 + clamped;
  }, [note]);

  return (
    <Page>
      <header>
        <h1>Ferramentas</h1>
        <p>Afinador cromático pra ensaio e apresentação.</p>
      </header>

      <CardsStack>
        <Card>
          <h2>Afinador cromático</h2>
          <p className="hint">Use o microfone do aparelho pra afinar qualquer instrumento em tempo real.</p>

          <TunerControls ref={deviceMenuRef}>
            <TunerToggle $active={listening} onClick={toggle}>
              {listening ? <FiMicOff size={18} /> : <FiMic size={18} />}
              {listening ? "Parar afinador" : "Ativar microfone"}
            </TunerToggle>

            <DeviceMenuButton
              type="button"
              aria-label="Alterar microfone"
              aria-expanded={deviceMenuOpen}
              onClick={() => setDeviceMenuOpen((s) => !s)}
            >
              <FiChevronDown size={18} />
            </DeviceMenuButton>

            {deviceMenuOpen && (
              <DeviceMenu>
                <h3>Alterar microfone</h3>
                {devices.length === 0 ? (
                  <p className="hint">
                    Nenhum microfone detectado ainda. Ative o afinador pra liberar a lista.
                  </p>
                ) : (
                  devices.map((d, i) => (
                    <DeviceOption
                      key={d.deviceId || i}
                      type="button"
                      className={deviceId === d.deviceId ? "active" : ""}
                      onClick={() => {
                        setDeviceId(d.deviceId);
                        setDeviceMenuOpen(false);
                      }}
                    >
                      <span className="radio" />
                      <span className="label">{d.label || `Microfone ${i + 1}`}</span>
                    </DeviceOption>
                  ))
                )}
              </DeviceMenu>
            )}
          </TunerControls>

          {error && <TunerError>{error}</TunerError>}

          <TunerDisplay $status={status}>
            {note ? (
              <>
                <div className="note">
                  {note.name}
                  <span className="octave">{note.octave}</span>
                </div>
                <div className="freq">
                  {pitch.toFixed(1)} Hz · {note.cents > 0 ? "+" : ""}
                  {note.cents} cents
                </div>
                <Gauge>
                  <GaugeTrack>
                    <GaugeNeedle $percent={needlePercent} />
                  </GaugeTrack>
                </Gauge>
              </>
            ) : (
              <p className="placeholder">
                {listening ? "Toque uma nota perto do microfone..." : "Ative o microfone pra começar a afinar."}
              </p>
            )}
          </TunerDisplay>
        </Card>
      </CardsStack>
    </Page>
  );
}
