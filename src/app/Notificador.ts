import { WebClient } from "@slack/web-api";
import { Member } from "@slack/web-api/dist/response/UsersListResponse";

import { Notificacion } from "./types";

export class Notificador {
  private slack: WebClient;

  constructor(token: string, private default_channel: string) {
    this.slack = new WebClient(token);
  }

  async buscar(nombresBuscados: string[]): Promise<Array<string>> {
    const miembros = await this.traerMiembros();

    const nombresEncontrados: string[] = [];
    for (const nombre of nombresBuscados) {
      const miembro = this.encontrarMiembro(miembros, nombre);
      if (!miembro) continue;
      nombresEncontrados.push(nombre);
    }

    return nombresEncontrados;
  }

  private async traerMiembros() {
    return (await this.slack.users.list().then((res) => res.members)) || [];
  }

  private encontrarMiembro(miembros: Member[], nombre: string) {
    return miembros.find(
      (miembro) => miembro.name === nombre || miembro.real_name === nombre,
    );
  }

  async enviar(notificaciones: Notificacion[]) {
    const miembros = await this.traerMiembros();
    await Promise.allSettled(
      notificaciones.map((notificacion) =>
        this.enviarNotificacionEntreUsuarios(notificacion, miembros),
      ),
    );
  }

  private async enviarNotificacionEntreUsuarios(
    notificacion: Notificacion,
    miembros: Member[],
  ) {
    const { nombreSlack, mensaje } = notificacion;
    const miembro = this.encontrarMiembro(miembros, nombreSlack);
    if (miembro && miembro.id) {
      await this.enviarMensajesACanal(miembro.id, mensaje);
      return;
    }
    const mensajeDeCanal = `${nombreSlack}: ${mensaje}`;
    await this.enviarMensajesACanal(this.default_channel, mensajeDeCanal);
  }

  private async enviarMensajesACanal(channel_id: string, mensaje: string) {
    await this.slack.chat.postMessage({
      channel: channel_id,
      text: mensaje,
    });
  }
}
